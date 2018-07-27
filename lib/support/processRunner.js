/* eslint handle-callback-err: 0 */
/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict'

var _ = require('lodash')
var async = require('async')
var spawn = require('child_process').spawn
var psTree = require('ps-tree')
var util = require('./util')()


module.exports = function () {
  var isWin = /^win/.test(process.platform)

  var commonRun = function (isPrerun, mode, container, exitCb, cb) {
    if (isPrerun && container.process) {
      container.process.flags.prerunning = true
    }

    var child = {}
    var cwd = container.path
    var called = false
    var cmd
    var args
    var env
    var toks

    var command = isPrerun ? container.prerun : container.run
    toks = util.tokenizeCommand(command)
    if (container.type === 'node') {
      cmd = process.argv[0]

      if (toks[0] === 'node') {
        args = toks.splice(1)
      } else {
        args = toks
      }

      if (container.debugMode) {
        args.unshift('--inspect')
      }
    } else {
      cmd = toks[0]
      args = toks.splice(1)
    }

    env = Object.assign({}, process.env)
    if (container.environment) {
      env = Object.assign(env, container.environment)
    }

    if (mode !== 'preview') {
      var options = {cwd: cwd, env: env, stdio: ['ignore', 'pipe', 'pipe'], detached: false}
      if (container.type === 'node' && !isWin) {
        options.stdio[3] = 'ipc'
      }

      if (isPrerun) {
        console.log('pre-run step: ' + container.name + ' [' + container.prerun + ']')
      }

      child = spawn(cmd, args, options)
      child.unref()

      child.on('error', function (err) {
        if (!called) {
          if (isPrerun) {
            console.log('pre-run step had errors')
            if (container.process) {
              container.process.flags.prerunning = false
            }
          }

          called = true
          exitCb(err, container, child, -1)
        }
      })

      child.on('exit', function (code) {
        if (!called) {
          if (isPrerun) {
            console.log('pre-run step completed successfully')
            if (container.process) {
              container.process.flags.prerunning = false
            }
          }
          called = true
          exitCb(null, container, child, code)
        }
      })

    } else {
      child.detail = { cmd: cmd,
        args: args,
        environment: env,
        cwd: cwd }
    }

    cb(null, child)
  }

  var prerun = function (mode, container, exitCb, cb) {
    var runModeIsPrerun = true
    commonRun(runModeIsPrerun, mode, container, exitCb, cb)
  }

  var run = function (mode, container, exitCb, cb) {
    var runModeIsPrerun = false
    commonRun(runModeIsPrerun, mode, container, exitCb, cb)
  }

  var start = function (system, mode, container, exitCb, cb) {
    if (container && container.run) {
      if (container.type === 'process' && container.prerun) {
        // if there's a prerun task then execute that before running
        prerun(mode, container, function (err, child) {
          // when the pre-run task has exited we can continue
          if (err) {
            exitCb(err, container, child, -1)
          } else {
            run(mode, container, exitCb, cb)
          }
        }, function () {
          // for the pre-run step we ignore standard callback
        })
      } else {
        run(mode, container, exitCb, cb)
      }
    } else {
      console.log('warning: ' + container.name + ' not started, missing execute statement')
      cb(container.name + ' not started, missing execute statement')
    }
  }



  var kill = function kill (container, pid, signal, cb) {
    if (pid) {
      psTree(pid, function (err, children) {
        async.eachSeries(children, function (child, next) {
          console.log('sending ' + signal + ' to  child process: ' + child.PID)
          try {
            process.kill(child.PID, signal)
          } catch (e) {}
          next()
        }, function () {
          console.log('sending ' + signal + ' to  parent process: ' + pid)
          try {
            process.kill(pid, signal)
          } catch (e) {}
          cb(null)
        })
      })
    }
  }



  var stop = function stop (container, pid, cb) {
    kill(container, pid, 'SIGKILL', cb)
  }



  function exitCb (cb) {
    return function (err, container, child, code) {
      if (err) {
        console.log(container.name + ' error: ' + err)
      }
      cb(err || null)
    }
  }



  function runCommand (system, container, command, commandName, cb) {
    var c
    var process
    var procColour = util.selectColourWhite()

    c = _.cloneDeep(container)
    c.run = command
    c.name = c.name + '_' + commandName
    c.type = 'process'
    c.prerun = undefined
    start(system, 'live', c, exitCb(cb), function (err, child) {

      process = {identifier: c.name,
        running: true,
        exitCode: null,
        colour: procColour,
        child: child,
        startTime: Date.now(),
        monitor: false,
        tail: true}

      util.streamOutput({process: process, name: c.name, tail: true}, system.global.log_path, true)
    })
  }



  return {
    start: start,
    stop: stop,
    runCommand: runCommand
  }
}


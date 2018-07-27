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

var path = require('path')
var test = require('tap').test
var runner = require('../lib/support/processRunner')()
var config = require('fuge-config')()


var exitCb = function () {
}


test('shell runner test', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.runshell, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)

      setTimeout(function () {
        runner.stop(system.topology.containers.runshell, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('shell runner two test', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.runshell2, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)

      setTimeout(function () {
        runner.stop(system.topology.containers.runshell, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('process runner test', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.runme, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)
      setTimeout(function () {
        runner.stop(system.topology.containers.runme, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('node runner test', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.runnode, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)

      setTimeout(function () {
        runner.stop(system.topology.containers.runnode, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('node runner test 2', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.runnode2, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)

      setTimeout(function () {
        runner.stop(system.topology.containers.runnode2, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('preview test', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'preview', system.topology.containers.runme, exitCb, function (err, child) {
      t.equal(null, err)
      t.equal('node', child.detail.cmd)
      t.deepEqual(['runme.js'], child.detail.args)
    })
  })
})


test('process exit test', function (t) {
  t.plan(3)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.willfail, exitCb, function (err, child) {
      t.equal(null, err)
      setTimeout(function () {
        runner.stop(system.topology.containers.willfail, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('missing exec', function (t) {
  t.plan(2)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    system.topology.containers.runme.run = undefined
    runner.start(system, 'live', system.topology.containers.runme, exitCb, function (err) {
      t.notEqual(null, err)
    })
  })
})


test('process fail test', function (t) {
  t.plan(3)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.wibble, exitCb, function (err, child) {
      t.equal(null, err)
      t.equal(undefined, child.pid)
    })
  })
})


test('process kill test', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'fuge.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.runme, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)
      setTimeout(function () {
        process.kill(child.pid, 'SIGKILL')
        runner.stop(system.topology.containers.runme, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})


test('prerun test 1', function (t) {
  t.plan(4)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'prerun.yml'), function (err, system) {
    t.equal(err, null)
    runner.start(system, 'live', system.topology.containers.prerun, exitCb, function (err, child) {
      t.equal(null, err)
      t.notEqual(undefined, child.pid)

      setTimeout(function () {
        runner.stop(system.topology.containers.prerun, child.pid, function (err) {
          t.equal(null, err)
        })
      }, 100)
    })
  })
})

test('prerun test 2 (failure test)', function (t) {
  t.plan(3)

  config.load(path.join(__dirname, 'fixture', 'system', 'fuge', 'prerun.yml'), function (err, system) {
    t.equal(err, null)

    runner.start(system, 'live', system.topology.containers.prerunfail, exitCb, function (err, child) {
      t.notEqual(null, err)
      t.equal(undefined, child)
    })
  })
})

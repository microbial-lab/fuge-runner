/*jshint -W069 */
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

'use strict';

module.exports = function(what, where, callback) {
	var exec = require('child_process').exec;

	exec('grep ' + what + ' ' + where + ' -nr', function(err, stdin) {
		var list = {};
		var results = stdin.split('\n');

    // remove last element (it’s an empty line)
    results.pop();

    for (var x = 0; x < results.length; x++) {
      var eachPart1 = results[x].split(':'); //file:linenum:line
      list[eachPart1[0]] = [];
    }

    for (var i = 0; i < results.length; i++) {
      var eachPart = results[i].split(':'); //file:linenum:line
      var details = {};
      var filename = eachPart[0];
      details['line_number'] = eachPart[1];

      eachPart.shift();
      eachPart.shift();
      details.line = eachPart.join(':');

      list[filename].push(details);
    }


    var res = [];
    var files = Object.keys(list);
    for(var a = 0; a < files.length; a++) {
      res.push({ 'file' : files[a], 'results' : list[files[a]] });
    }

    callback(res);
	});
};

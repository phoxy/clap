var system = require('system');

// Correct file execute is 'file' 'in_file' 'out_file'
if (system.args.length < 3)
  phantom.exit();

/***
 * Reading arguments object from file
 ***/
function GetInitObject()
{
  var in_file = system.args[1];
  var out_file = system.args[2];

  var fs = require('fs');
  var in_string = fs.read(in_file);
  var in_object = JSON.parse(in_string);

  in_object.phantomjs_output_tunnel_file = out_file;
  return in_object;
}

var args = GetInitObject();
var result = {};

/***
 * Preparing to download page
 ***/

var page = require('webpage').create();
for (var k in args.page_settings)
  page.settings[k] = args.page_settings[k];

for (var k in args.cookies)
  phantom.addCookie(args.cookies[k]);


page.onResourceTimeout = function(e) {
  console.log('timeout');
  phantom.exit(1);
};

page.onResourceRequested = function(requestData, request) {
    if ((/google-analytics\.com/gi).test(requestData['url'])){
        console.log('Request to GA. Aborting: ' + requestData['url']);
        request.abort();
    }
};

page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
};

/***
 * Download page and execute code
 ***/

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.open(args.url, function (status)
{
  if (status !== 'success')
  {
    console.log('LOAD_FAIL');
    result.error = {};
    result.error.reason = page.reason;
    result.error.reason_url = page.reason_url;
    result.error.status = status;
    result.page = JSON.stringify(page);

    exit_now();
  }
  else
  {
    page.onCallback = function()
    {
      page.evaluate(function()
      {
        var scripts = div.getElementsByTagName('script');
        var i = scripts.length;
        while (i--)
          scripts[i].parentNode.removeChild(scripts[i]);

        var meta = div.getElementsByTagName('meta');
        var i = meta.length;
        while (i--)
          if (meta.getAttribute('name') == 'fragment')
            meta[i].parentNode.removeChild(meta[i]);
      });

      exit_now();
    }
  }
});


/***
 * Preparing to exit
 ***/

var export_flag = false;

function tunnel_result_and_exit(res)
{
  result.inject = res;
  exit_now();
}

function exit_now()
{
  export_flag = true;
}

var exportf = function(res)
{
  var fs = require('fs');

  res.sys = {page: page.content};
  fs.write(args.phantomjs_output_tunnel_file, JSON.stringify(res), 'w');
  phantom.exit();
};

// Wait for result
(function wait_for_flag()
{
  if (export_flag)
    return exportf(result);
  setTimeout(arguments.callee, 100);
})();

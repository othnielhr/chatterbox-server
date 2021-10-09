/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  // PUT(statusCode = 201) and DELETE(statusCode = 204) work similarly as in they look for the target within the set of data and edit/delete that object
  // we can take advantage of a unique id to look for the target within our data set
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var messages = { results: [] };
var uniqueId = 0;

var requestHandler = function (request, response) {
  // console.log('request', request, 'response', response);
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  /*   if url does NOT contain '/classes/messages', should return a responseCode of 404 */

  if (request.method === 'GET' && request.url.includes('/classes/messages')) {
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(messages)); //template of result object {results = []}
    // response.writeHead(statusCode, headers);
    // response.end('No data!');
  } else if (request.method === 'POST' && request.url.includes('/classes/messages')) {
    var body = '';
    request.on('data', chunk => {
      body += chunk;
    });
    request.on('end', () => {
      var data = JSON.parse(body);
      data.createdAt = new Date();
      data.id = uniqueId;
      uniqueId++;
      console.log('data?', data);
      messages.results.push(data);
    });
    statusCode = 201;
    response.writeHead(statusCode, headers);
    // console.log('postman');
    // https://nodejs.dev/learn/get-http-request-body-data-using-nodejs
    // ^^^^^^^^^^ FOR request.on() TO GET DATA FROM HTTP REQEUST
    // add storage array
    // create a date maker for createAt
    // for POST, responseCode should be changed to 201 for confirmation
    // console.log('request', request);
    response.end(/*JSON.stringify(data)*/);
  } else if (request.method === 'OPTIONS' && request.url.includes('/classes/messages')) {
    var template = { username: 'your username', text: 'your text', roomname: 'your room name' };
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(template));
  } else if (request.method === 'DELETE' && request.url.includes('/classes/messages')) {
    // iterate over message.results array
    // if id of current element is same as our id
    var body = '';
    request.on('data', chunk => {
      body += chunk;
    });
    request.on('end', () => {
      var data = JSON.parse(body);
      for (var i = 0; i < messages.results.length; i++) {
        if (messages.results[i].id === data.id) {
          messages.results.splice(i, 1);
        }
      }
    });
    // looks like it works, need to write a test for this case
    // PUT should work similarly to this except it requires a full message template rather than just a id number
    // maybe don't allow user to change username
    statusCode = 204;
    response.writeHead(statusCode, headers);
    response.end();
  } else if (request.method === 'PUT' && request.url.includes('/classes/messages')) {
    var body = '';
    request.on('data', chunk => {
      body += chunk;
    });
    request.on('end', () => {
      var data = JSON.parse(body);
      for (var i = 0; i < messages.results.length; i++) {
        if (messages.results[i].id === data.id) {
          messages.results[i].text = data.text;
          messages.results[i].roomname = data.roomname || null;
        }
      }
    });
    statusCode = 201;
    response.writeHead(statusCode, headers);
    response.end();
  } else {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }


  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end('Hello, World!, Hello myself');
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


exports.requestHandler = requestHandler;

// EXAMPLE MESSAGES
// {"username": "enzozozo",
// "text": "this is a message",
// "roomname": "lobby"
// }

// {"username": "othniel",
// "text": "new messageeeeeeeee",
// "roomname": "lobby"
// }
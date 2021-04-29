const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000



var main = require('./src/main')

main.init()



//const httpServer = require("http").createServer(app)
//httpServer.listen(PORT, function () {
//  console.log('Server started on port:', PORT)
//})


app.use(function (req, res, next) {

  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  next();


},
  express.static('client'))



/*
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  next();
})

app.use(express.static('static'))


function redirect(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  switch (req.url.substr(req.url.lastIndexOf('.') + 1)) {
    case 'js':
      fs.readFile(PATH + '/static/js/' + decodeURI(req.url), function (err, data) {
        if (err) { return }
        res.writeHead(200, { 'Content-type': 'text/javascript; charset=utf-8' })
        res.write(data)
        res.end()
      })
      break
    case 'css':
      fs.readFile(PATH + '/static/css/' + decodeURI(req.url), function (err, data) {
        if (err) { return }
        res.writeHead(200, { 'Content-type': 'text/css; charset=utf-8' })
        res.write(data)
        res.end()
      })
      break
    default:
      if (req.url === '/index' || req.url === '/index.html') {
        fs.readFile(PATH + '/index.html', function (err, data) {
          if (err) { return }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.write(data, 'utf-8')
          res.end()
        })
      }
      break
  }
}



const server = http.createServer(function (req, res) {
  redirect(req, res)
})

server.listen(PORT, function () {
  console.log('Server started on port:', PORT)
})

*/
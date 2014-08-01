//********************** CONFIGURACION ****************************************
var HOST_BD = "localhost";
var USUARIO_BD = "root";
var CLAVE_BD = "contra";
//FIN ********************** CONFIGURACION ****************************************




//********************** LIBRERIAS NODEJS ****************************************
var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
//FIN ********************** LIBRERIAS NODEJS ****************************************




//********************** VARS GLOBALES ****************************************
var reqGlobal; 
var resGlobal; 
//FIN ********************** VARS GLOBALES  ***********************************


//********************** SERVIDOR ***********************************

http.createServer(
  function (req, res) 
  {
      reqGlobal = req;
      resGlobal = res;

      //console.log(reqGlobal);


      var aPUrl = req.url.split("/");
      var strPrimeraParteURL = aPUrl[1];

      if(strPrimeraParteURL != "ajax")
      {
        if(strPrimeraParteURL.length==0 || strPrimeraParteURL=="/")
          entregarHome();
        if(strPrimeraParteURL == "datos")
          entregarDatos();
      }

      if(strPrimeraParteURL == "ajax"){
        if(aPUrl[2]=="agregar"){
          agregar();     
        }
      }
                
     
      if(strPrimeraParteURL == "recursos")
          entregarRecuso(); 
     
  }
).listen(1337, '127.0.0.1');

console.log('ejecutando en http://127.0.0.1:1337/');
//FIN ********************** SERVIDOR ***********************************





//********************** FUNCIONES ***********************************

function entregarRecuso()
{
     var img = fs.readFileSync("." + reqGlobal.url);
     resGlobal.writeHead(200, {'Content-Type': 'image/gif' });
     resGlobal.write(img,'binary');
     resGlobal.end();
}


//********************** HTMLs ***********************************

function entregarHome()     
{
   resGlobal.writeHead(200, {'Content-Type': 'text/html'});
   resGlobal.write(fs.readFileSync("./htmls/encabezado.html", "utf8"));
   resGlobal.write(fs.readFileSync("./htmls/home.html", "utf8"));
   resGlobal.write(fs.readFileSync("./htmls/pie.html", "utf8"));
   resGlobal.end();
}

function entregarDatos()     
{
   resGlobal.writeHead(200, {'Content-Type': 'text/html'});
   resGlobal.write(fs.readFileSync("./htmls/encabezado.html", "utf8"));
   resGlobal.write(fs.readFileSync("./htmls/datos.html", "utf8"));
   resGlobal.write(fs.readFileSync("./htmls/pie.html", "utf8"));
   resGlobal.end();
}

//FIN ********************** HTMLs ***********************************






// ********************** AJAX ***********************************
function agregar()
{ 
 
    resGlobal.writeHead(200, {'Content-Type': 'text/html'});

    processPost(reqGlobal, resGlobal, function() {
        //console.log("tel: " + reqGlobal.post.tel);

        var htmlRes = "nombre: " + reqGlobal.post.nombre;
        htmlRes += "<br>tel: " + reqGlobal.post.tel;

        var strIdUnico = Math.floor((1 + Math.random()) * 0x10000).toString(16);

        var strLeidoBD = fs.readFileSync("/nodejs/servidor/bd/bd.txt", "utf8");
        var objJSONBD = JSON.parse(strLeidoBD);

        //var objJSONBD = {};
        objJSONBD.contacto2 = {};
        objJSONBD.contacto2.elid = strIdUnico;
        objJSONBD.contacto2.nombre = reqGlobal.post.nombre;
        objJSONBD.contacto2.tel = reqGlobal.post.tel;

        console.log(objJSONBD);

        var strObjJSONBD = JSON.stringify(objJSONBD);

        fs.writeFile("/nodejs/servidor/bd/bd.txt", strObjJSONBD, function(err) {
            if(err) {
                  console.log(err);
              } else {
                  //console.log("bd.txt actualizado...");
              }
        }); 
    
        resGlobal.write(htmlRes);
        resGlobal.end();        
    });

              
}
// FIN ********************** AJAX ***********************************



//  ********************** VARIAS ***********************************
function processPost(request, response, callback) {
    var queryData = '';
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            //console.log("datos llegando...:"+data);
            queryData += data;
        });

        request.on('end', function() {
            //console.log("datos completos...:"+queryData);
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}


// FIN ********************** VARIAS ***********************************
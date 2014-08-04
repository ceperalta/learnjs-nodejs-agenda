//********************** CONFIGURACION ****************************************
var BD_TXT = "/nodejs/servidor/bd/bd.txt";
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
        if(aPUrl[2]=="eliminar"){
          eliminar();     
        }
         if(aPUrl[2]=="tomarListaTels"){
          tomarListaTels();     
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

function eliminar(){
    processPost(reqGlobal, resGlobal, function() {
         var strLeidoBD = fs.readFileSync(BD_TXT, "utf8");
         var objJSONBD = JSON.parse(strLeidoBD);

         var objNuevo = {};
         objNuevo.contactos = [];

         for(i=0; i<objJSONBD.contactos.length; i++){
            if(objJSONBD.contactos[i].elid !==  reqGlobal.post.strIDPar){
                 var objJSONNuevoContacto = {};

                objJSONNuevoContacto.elid = objJSONBD.contactos[i].elid;
                objJSONNuevoContacto.nombre = objJSONBD.contactos[i].nombre;
                objJSONNuevoContacto.tel =  objJSONBD.contactos[i].tel;
                objNuevo.contactos.push(objJSONNuevoContacto);
            }

         }

        var strJSON = JSON.stringify(objNuevo);

        fs.writeFile(BD_TXT, strJSON, function(err) {
            if(err) {
                  console.log(err);
              } else {
                  //console.log("bd.txt actualizado...");
              }
        });


         resGlobal.writeHead(200, {'Content-Type': 'text/html'});
         resGlobal.write(strJSON);
         resGlobal.end();  


    });
}

function agregar()
{ 
  
    processPost(reqGlobal, resGlobal, function() {
       
        var strIdUnico = Math.floor((1 + Math.random()) * 0x10000).toString(16);

        var objJSONBD;

        if(fs.existsSync(BD_TXT)){
            var strLeidoBD = fs.readFileSync(BD_TXT, "utf8");
            objJSONBD = JSON.parse(strLeidoBD);
        }
        else{
          objJSONBD = {};
          objJSONBD.contactos = [];
        }
        
        var objJSONNuevoContacto = {};

        objJSONNuevoContacto.elid = strIdUnico;
        objJSONNuevoContacto.nombre = reqGlobal.post.nombre;
        objJSONNuevoContacto.tel = reqGlobal.post.tel;

        objJSONBD.contactos.push(objJSONNuevoContacto);

        var strObjJSONBD = JSON.stringify(objJSONBD);

        fs.writeFile(BD_TXT, strObjJSONBD, function(err) {
            if(err) {
                  console.log(err);
              } else {
                  //console.log("bd.txt actualizado...");
              }
        }); 


       
         resGlobal.writeHead(200, {'Content-Type': 'text/html'});
         resGlobal.write(strObjJSONBD);
         resGlobal.end();   
            
    });
  

  
   
              
}

function tomarListaTels(){
   var strLeidoBD = '';
   if(fs.existsSync(BD_TXT)){
      strLeidoBD = fs.readFileSync(BD_TXT, "utf8");
   }
   resGlobal.writeHead(200, {'Content-Type': 'text/html'}); 
   resGlobal.write(strLeidoBD);
   resGlobal.end();   
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
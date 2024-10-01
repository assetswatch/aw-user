function loadFiles(arrobjfiles) {
  try {
    let fr = "";
    arrobjfiles?.forEach((fl) => {
      let files = fl?.files;
      if (fl.type.toLowerCase() === "js") {
        files.forEach((f) => {
          fr = "";
          fr = document.createElement("script");
          fr.setAttribute("id", "js_" + f.substring(0, f.lastIndexOf(".")));
          fr.setAttribute("type", "text/javascript");
          fr.setAttribute("src", fl.dir + f);
          document.getElementsByTagName(fl.pos)[0].appendChild(fr);
        });
      } else if (fl.type.toLowerCase() === "css") {
        files.forEach((f) => {
          fr = "";
          fr = document.createElement("link");
          fr.setAttribute("rel", "stylesheet");
          fr.setAttribute("id", "css_" + f.substring(0, f.lastIndexOf(".")));
          fr.setAttribute("type", "text/css");
          fr.setAttribute("href", fl.dir + f);
          document.getElementsByTagName(fl.pos)[0].appendChild(fr);
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}

function unloadFile(arrobjfiles) {
  try {
    arrobjfiles?.forEach((fl) => {
      let files = fl?.files;
      if (fl.type.toLowerCase() === "js") {
        files.forEach((f) => {
          if (
            document.getElementById("js_" + f.substring(0, f.lastIndexOf(".")))
          ) {
            document
              .getElementsByTagName(fl.pos)[0]
              .removeChild(
                document.getElementById(
                  "js_" + f.substring(0, f.lastIndexOf("."))
                )
              );
          }
        });
      } else if (fl.type.toLowerCase() === "css") {
        files.forEach((f) => {
          if (
            document.getElementById("css_" + f.substring(0, f.lastIndexOf(".")))
          ) {
            document
              .getElementsByTagName(fl.pos)[0]
              .removeChild(
                document.getElementById(
                  "css_" + f.substring(0, f.lastIndexOf("."))
                )
              );
          }
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}

function loadFile(objfile) {
  return new Promise(function (resolve, reject) {
    try {
      let fr = "";
      if (objfile.type.toLowerCase() === "js") {
        fr = document.createElement("script");
        fr.setAttribute(
          "id",
          "js_" + objfile.file.substring(0, objfile.file.lastIndexOf("."))
        );
        fr.setAttribute("type", "text/javascript");
        fr.setAttribute("src", objfile.dir + objfile.file);
        fr.onload = () => {
          resolve();
        };
        fr.onerror = () => {
          reject();
        };
        document.getElementsByTagName(objfile.pos)[0].appendChild(fr);
      } else if (objfile.type.toLowerCase() === "css") {
      }
    } catch (err) {
      console.log(err.message);
    }
  });
}

function getArrLoadFiles(fl) {
  let arrfiles = [];
  fl.forEach((of) => {
    of.files.forEach((f) => {
      arrfiles.push({
        dir: of.dir,
        pos: of.pos,
        type: of.type,
        file: f,
      });
    });
  });
  return arrfiles;
}

export { loadFile, unloadFile, loadFiles, getArrLoadFiles };

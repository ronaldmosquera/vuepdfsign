a
<template>
  <div>
    <form method="post">
      <input
        type="file"
        id="uploadedFile"
        name="uploadedFile"
        style="display: none"
        @change="preview"
      />
    </form>

    <v-card>
      <v-card-title style="padding-left: 450px">
        <!-- <v-btn class="mx-3" small solid color="primary" @click="borrarFirma()">
          <v-icon>mdi-minus </v-icon>Borrar firma</v-btn
        > -->

        <v-btn
          class="mx-3"
          small
          solid
          title="Carga un archivo PDF para firmar"
          color="blue white--text"
          @click="openFile()"
        >
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-divider class="mx-6" inset vertical></v-divider>

        <v-btn
          class="mx-3"
          small
          solid
          title="Página anterior"
          color="blue white--text"
          @click="previousPage()"
        >
          <v-icon>mdi-step-backward</v-icon>
        </v-btn>
        {{ currentPage }}/{{ totalPages }}

        <v-btn
          class="mx-3"
          small
          solid
          title="Siguiente página"
          color="blue white--text"
          @click="nextPage()"
        >
          <v-icon>mdi-step-forward</v-icon>
        </v-btn>

        <v-btn
          class="mx-3"
          small
          solid
          title="Agrega una firma en la página actual"
          color="primary"
          @click="agregarFirma()"
          :disabled="this.fileUrl == ''"
        >
          <v-icon>mdi-plus</v-icon>Agregar firma</v-btn
        >
        <v-divider class="mx-6" inset vertical></v-divider>
        <v-btn
          class="mx-3"
          small
          solid
          title="Descargar archivo firmado"
          :disabled="firmas.length == 0"
          color="blue white--text"
          @click="downloadSignedFile()"
        >
          <v-icon>mdi-download</v-icon></v-btn
        >

        <v-btn
          class="mx-3"
          small
          solid
          title="Enviar archivo firmado por email"
          color="blue white--text"
          :disabled="firmas.length == 0"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </v-card-title>
    </v-card>
    <v-row>
      <v-col md="3">
        <v-card class="mt-5 mx-4 pl-4 pt-6" height="900px">
          <v-card-title>Firmante:</v-card-title>
          <v-card-text>
            {{ firmante }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="9">
        <v-card class="mt-5 mx-4" height="900px" width="auto">
          <div class="list">
            <DragResize
              v-for="rect in firmasPagina"
              parent-limitation
              :key="rect.element.elementId"
              :isActive="rect.element.active"
              :isResizable="isResizable"
              :parentW="listWidth"
              :parentH="listHeight"
              :axis="axis"
              :zIndex="zindex"
              :minw="minw"
              :minh="minh"
              :w="rect.element.coordinates.width"
              :h="rect.element.coordinates.height"
              :x="rect.element.coordinates.left"
              :y="rect.element.coordinates.top"
              v-on:resizing="resize($event, rect.element.elementId)"
              v-on:dragging="resize($event, rect.element.elementId)"
              v-on:activated="activateEv(rect.element.elementId)"
              v-on:deactivated="deactivateEv(rect.element.elementId)"
              ><div class="filler">
                Firmado digitalmente por: {{ rect.displayName }} <br />
                Fecha: {{ fechaActual }}
              </div>
            </DragResize>
            <div v-if="fileUrl != ''" id="mycanvas"></div>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- <toolbar></toolbar> -->
    <!-- <router-view /> -->
  </div>
</template>

<style>
/*body {
  height: 100vh;
  width: 100vw;
  background-color: #ececec;
}*/

.filler {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  background-color: rgb(127, 204, 255);
  color: black;
  font-size: x-small;
  text-align: left;
}

.list {
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: auto;
  width: auto;
  box-shadow: 0 0 2px #aaa;
  background-color: white;
}
#mycanvas {
  direction: ltr;
  border: 1px solid black;
  float: left;
}
.box-shaddow {
  box-shadow: 10px 10px 15px 0px rgba(125, 125, 125, 1);
}
#app {
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: relative;
  font-family: "Lato", sans-serif;
}
</style>
<script setup>
import DragResize from "vue-drag-resize";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import axios from "axios";
</script>
<script>
var pdfDoc = null;
const emptyElement = () => {
  return {
    coordinates: {
      page: 1,
      left: 100,
      top: 100,
      height: 60,
      width: 110,
    },
    active: false,
    elementId: 0,
  };
};

const emptySignerData = () => ({
  displayName: "",
  me: true,
  email: "",
  element: emptyElement(),
});

export default {
  name: "visor-pdf",
  components: {
    DragResize,
  },

  props: {},

  data() {
    return {
      listWidth: 0,
      listHeight: 0,
      currentPage: 0,
      totalPages: 0,
      pageRendering: false,
      pageNumPending: null,
      fileUrl: "",
      archivoUrl: "",
      currentSigner: emptySignerData(),
      firmas: [],
      isActive: true,
      isResizable: true,
      key: 1,
      zindex: 1,
      axis: "both",
      minw: 25,
      minh: 25,
      firmante: "RONALD ANDRES MOSQUERA VAREA",
    };
  },
  computed: {
    stringFirmas() {
      var sp = [];
      for (let i = 0; i < this.firmas.length; i++) {
        let j = {};
        let c = this.firmas[i].element.coordinates;
        j.pg = c.page.toString();
        j.V = "true";
        j.fs = "7";
        j.llx = c.left.toString();
        j.lly = (this.listHeight - c.top - c.height).toString();
        j.urx = (c.left + c.width).toString();
        j.ury = (this.listHeight - c.top).toString();
        sp.push(j);
      }
      return JSON.stringify(sp);
    },
    firmasPagina() {
      var sp = [];
      for (let i = 0; i < this.firmas.length; i++) {
        if (this.firmas[i].element.coordinates.page == this.currentPage) {
          sp.push(this.firmas[i]);
        }
      }
      return sp;
    },
    fechaActual() {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();

      today = dd + "." + mm + "." + yyyy;
      return today;
    },
  },
  methods: {
    getPage(pageNumber) {
      let pdf = pdfDoc;
      this.pageRendering = true;
      let container = document.getElementById("mycanvas");
      pdf.getPage(pageNumber).then((page) => {
        let scale = 1; // (container.offsetWidth - 3) / page.view[2];
        let viewport = page.getViewport({ scale: scale });
        let canvas = document.createElement("canvas");
        this.listHeight = viewport.height;
        this.listWidth = viewport.width;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        container.innerHTML = "";
        container.appendChild(canvas);
        let ctx = canvas.getContext("2d");
        var renderContext = {
          canvasContext: ctx,
          //transform: [1, 0, 0, 1, 0, 0],
          viewport: viewport,
          //intent: "print",
        };

        var renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
          //console.log("Page rendered");
          this.pageRendering = false;
          if (this.pageNumPending != null) {
            this.getPage(this.pageNumPending);
            this.pageNumPending = null;
          }
        });
      });
    },
    getPdf(url) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        process.env.VUE_APP_ENV === "devel"
          ? "pdf.worker.min.js"
          : "vuesignpdf/pdf.worker.min.js";
      let loadingTask = pdfjsLib.getDocument(url);

      loadingTask.promise.then(
        (pdf) => {
          console.log(this.currentPage);
          console.log(pdf.numPages);
          this.totalPages = pdf.numPages;
          pdfDoc = pdf;
          this.getPage(1);
        },
        function (reason) {
          alert(reason);
        }
      );
    },
    queueRenderPage(num) {
      if (this.pageRendering) {
        this.pageNumPending = num;
      } else {
        this.getPage(num);
      }
    },
    nextPage() {
      if (pdfDoc == null || this.currentPage >= pdfDoc.numPages) return false;
      this.currentPage++;
      this.queueRenderPage(this.currentPage);
    },
    previousPage() {
      if (this.currentPage == 1) return false;
      this.currentPage--;
      this.queueRenderPage(this.currentPage);
    },
    openFile() {
      document.getElementById("uploadedFile").click();
    },
    preview() {
      let files = document.getElementById("uploadedFile").files[0];
      if (files.type !== "application/pdf") {
        alert("Tipo de archivo inválido");
        return;
      }
      this.currentPage = 1;

      this.fileUrl = this.getObjectURL(files);

      const formData = new FormData();
      formData.append(
        "miarchivo.pdf",
        document.getElementById("uploadedFile").files[0]
      );
      let url =
        process.env.VUE_APP_ENV === "devel"
          ? process.env.VUE_APP_SIGNER_API_URL_DEV
          : process.env.VUE_APP_SIGNER_API_URL_PROD;

      axios
        .post(url + "/cargarArchivoPdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          this.archivoUrl = res.data.ulfile;
        });
    },
    getObjectURL(file) {
      let url = null;
      if (window.createObjectURL != undefined) {
        // basic
        url = window.createObjectURL(file);
      } else if (window.webkitURL != undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
      } else if (window.URL != undefined) {
        // mozilla(firefox)
        url = window.URL.createObjectURL(file);
      }
      return url;
    },

    agregarFirma() {
      if (this.currentPage > 0) {
        var sd = emptySignerData();
        sd.displayName = this.firmante;
        sd.element.elementId = this.firmas.length + 1;
        sd.element.coordinates.page = this.currentPage;
        this.firmas.push(sd);
      } else {
        alert("Seleccione primero un archivo");
      }
    },

    borrarFirma(index) {
      index = 1;
      this.firmas.splice(index, 1);
      for (let i = 0; this.firmas.length; i++) {
        if (this.firmas[i].element.active == true) this.firmas[i] = undefined;
      }
    },

    resize(newRect = null, index) {
      for (let i = 0; i < this.firmas.length; i++) {
        if (this.firmas[i].element.elementId == index) {
          this.firmas[i].element.coordinates.left = newRect.left;
          this.firmas[i].element.coordinates.top = newRect.top;
          this.firmas[i].element.coordinates.width = newRect.width;
          this.firmas[i].element.coordinates.height = newRect.height;
        }
      }
    },

    activateEv(index) {
      for (let i = 0; i < this.firmas.length; i++) {
        this.firmas[i].element.active = false;
        if (this.firmas[i].element.elementId == index) {
          this.firmas[i].element.active = true;
          console.log("activo" + index);
        }
      }
    },

    deactivateEv(index) {
      for (let i = 0; i < this.firmas.length; i++) {
        if (this.firmas[i].element.elementId == index) {
          this.firmas[i].element.active = false;
          console.log("desactivo" + index);
        }
      }
    },

    downloadSignedFile() {
      let url =
        process.env.VUE_APP_ENV === "devel"
          ? process.env.VUE_APP_SIGNER_API_URL_DEV
          : process.env.VUE_APP_SIGNER_API_URL_PROD;
      axios
        .post(
          url + "/firmarArchivoPdf",
          {
            user: "ronaldmosquera@yahoo.com",
            archivo: this.archivoUrl, //"Cotización COT17175-12.pdf",
            rutaArchivo: "/tmp/",
            //firmas: `[{"pg":"1","V":"true","fs":"7","llx":"360","lly":"540","urx":"520","ury":"640"},{"pg":"2","V":"true","fs":"8","llx":"360","lly":"540","urx":"520","ury":"640"}]`,
            //firmas: `[{"pg":"1","V":"true","fs":"7","llx":"1","lly":"0","urx":"120","ury":"30"}]`,
            firmas: this.stringFirmas,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          console.log(res.data);
          const linkSource = `data:application/pdf;base64,${res.data.contenido}`;
          const downloadLink = document.createElement("a");
          const fileName = res.data.nombreArchivo;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        });
    },
  },

  mounted() {},
  watch: {
    fileUrl(val) {
      this.firmas = [];
      this.getPdf(val);
    },
  },
};
</script>

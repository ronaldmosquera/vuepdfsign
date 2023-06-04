<template>
  <v-app>
    <visor-pdf v-if="true"></visor-pdf>
    <!-- <div class="list" id="list"></div> -->
  </v-app>
</template>
<style scoped>
.filler {
  width: 100%;
  height: 100%;
  display: inline-block;
  position: absolute;
}

.list {
  position: absolute;
  top: 30px;
  bottom: 30px;
  left: 30px;
  right: 300px;
  box-shadow: 0 0 2px #aaa;
  background-color: rgb(243, 241, 241);
}

.box-shaddow {
  box-shadow: 10px 10px 15px 0px rgba(125, 125, 125, 1);
}
</style>
<script>
//import HelloWorld from "./components/HelloWorld.vue";
//import DragResize from "vue-drag-resize";
import visorPdf from "./components/visor-pdf.vue";
const emptyElement = () => {
  return {
    coordinates: {
      page: 1,
      left: 100,
      top: 100,
      height: 50,
      width: 100,
    },
    elementId: 0,
  };
};

const emptySignerData = () => ({
  signed: null,
  displayName: "",
  fullName: null,
  me: false,
  fileUserId: 0,
  email: "",
  element: emptyElement(),
});

export default {
  name: "App",
  components: {
    //DragResize,
    visorPdf,
  },

  data() {
    return {
      listWidth: 0,
      listHeight: 0,
      isActive: true,
      isResizable: true,
      key: 1,
      zindex: 1,
      axis: "both",
      isDraggable: true,
      currentPage: 1,
      totalPages: 0,
      pageRendering: false,
      pageNumPending: null,
      fileUrl: "",
      currentSigner: emptySignerData(),
    };
  },

  methods: {
    resize(newRect) {
      const { coordinates } = this.currentSigner.element;

      this.currentSigner.element.coordinates = {
        ...coordinates,
        ...newRect,
      };
    },
  },

  mounted() {
    //let listEl = document.getElementById("list");
    //this.listWidth = listEl.clientWidth;
    //this.listHeight = listEl.clientHeight;
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>

"use strict";

var { exec } = lips; // browser

function main() {
    const scene_editor_node = document.getElementById("scene")
    const canvas_node = document.getElementById("canvas")
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(200, 0, 0)";
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect(30, 30, 50, 50);
}

document.addEventListener("DOMContentLoaded", main);
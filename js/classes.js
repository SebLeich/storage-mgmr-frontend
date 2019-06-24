/**
 * updated 25.04.2019
 * the class contains the super class of a drawable class
 */
class Drawable {
    /**
     * updated 25.04.2019
     * the constructor creates a new instance of a drawable object
     * z - length
     * x - width
     * y - height
     */
    constructor() {
        this.mesh = null;
    }
    /**
     * updated 26.04.2019
     * the method draws the element
     */
    draw(parentDimension, options) {
        var helper = null;
        var length = this.length;
        if (length == null) {
            length = (parentDimension.l - this.z);
        }
        switch (options.type) {
            default:
                var geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.length);
                var edges = new THREE.EdgesGeometry(geometry);
                this.mesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: "black" }));
                break;
            case "filled":
                var group = runtimeManager.groups.find(x => x.id == this.group);
                var color = "rgb(200, 200, 200)";
                var groupId = null;
                if (group != null && typeof (group) != "undefined") {
                    color = group.color;
                    groupId = group.id;
                }
                var geometry = new THREE.BoxGeometry(this.width, this.height, length, 4, 4, 4);
                var material = new THREE.MeshBasicMaterial({ color: color });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.groupColor = color;
                this.mesh.groupId = groupId;
                this.mesh.goodId = this.id;
                helper = new THREE.EdgesHelper(this.mesh, 0x333333);
                helper.material.linewidth = 1;
                break;
        }
        if (this.mesh != null) {
            if (parentDimension == null) {
                this.mesh.position.x = this.x;
                this.mesh.position.y = this.y;
                this.mesh.position.z = this.z;
            } else {
                this.mesh.position.z = this.z - (parentDimension.l / 2) + (length / 2);
                this.mesh.position.x = this.x - (parentDimension.w / 2) + (this.width / 2);
                this.mesh.position.y = this.y - (parentDimension.h / 2) + (this.height / 2);
            }
            scene.add(this.mesh);
        }
        if (helper != null) {
            helper.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            scene.add(helper);
        }
        renderer.render(scene, camera);
    }
}
/**
 * updated 25.04.2019
 * the class contains a container
 */
class Container extends Drawable {
    /**
     * updated 25.04.2019
     * the constructor creates a new instance of a container
     */
    constructor(object) {
        super();
        this.goods = [];
        this.height = null;
        this.width = null;
        this.length = null;
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        if (object != null && typeof (object) != "undefined") {
            if (object._Height != null && typeof (object._Height) != "undefined") {
                this.height = object._Height;
            }
            if (object._Width != null && typeof (object._Width) != "undefined") {
                this.width = object._Width;
            }
            if (object._Length != null && typeof (object._Length) != "undefined") {
                this.length = object._Length;
            }
            if (object._Goods != null && typeof (object._Goods) != "undefined") {
                for (var index in object._Goods) {
                    var g = new Good(object._Goods[index]);
                    this.addGood(g);
                }
            }
        }
    }
    /**
     * updated 26.04.2019
     * the method adds a good to the container
     */
    addGood(good) {
        this.goods.push(good);
    }
    /**
     * updated 26.04.2019
     * the method draws the container to the view
     */
    draw() {
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        var from = new THREE.Vector3(0, (this.height / -2), (this.length / 2));
        var to = new THREE.Vector3(0, (this.height / -2), (this.length / 2) + 1000);
        var direction = to.clone().sub(from);
        var length = direction.length();
        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, "red");
        scene.add(arrowHelper);
        var gridHelper = new THREE.GridHelper(1.5 * this.length, 15);
        gridHelper.position.set(0, (this.height / -2), 0);
        scene.add(gridHelper);
        runtimeManager.currentGridUUID = gridHelper.uuid;
        super.draw(null, { type: "bordered" });
        /*
        if (runtimeManager.drawEmpty) {
            for (var index in runtimeManager.solutions[0].empty) {
                runtimeManager.solutions[0].empty[index].draw({ l: this.length, w: this.width, h: this.height }, { type: "bordered" });
            }
        } else {
            for (var index in this.goods) {
                this.goods[index].draw({ h: this.height, w: this.width, l: this.length }, { type: "filled" });
            }
        }*/
        for (var index in this.goods) {
            this.goods[index].draw({ h: this.height, w: this.width, l: this.length }, { type: "filled" });
        }
    }
    /**
     * updated 26.04.2019
     * the method returns the total volume of the container
     */
    getTotalVolume() {
        return this.height * this.width * this.length;
    }
    /**
     * updated 26.04.2019
     * the method returns the used volume of the container
     */
    getUnUsedVolume() {
        return this.getTotalVolume() - this.getUsedVolume();
    }
    /**
     * updated 26.04.2019
     * the method returns the used volume of the container
     */
    getUsedVolume() {
        var used = 0.0;
        for (var index in this.goods) {
            used += this.goods[index].getTotalVolume();
        }
        return used;
    }
    /**
     * updated 16.05.2019
     * the method returns the solutions server object
     */
    toServerObject() {
        var goods = [];
        for (var index in this.goods) {
            goods.push(this.goods[index].toServerObject());
        }
        return {
            _Height: this.height,
            _Width: this.width,
            _Length: this.length,
            _Goods: goods
        };
    }
}
/**
 * updated 20.05.2019
 * the class contains an empty space
 */
class Empty extends Drawable {
    /**
     * updated 20.05.2019
     * the constructor creates a new instance of an empty space
     */
    constructor(object) {
        super();
        this.height = null;
        this.length = null;
        this.width = null;
        this.x = null;
        this.y = null;
        this.z = null;
        this.index = null;
        this.group = "empty";
        if (object != null && typeof (object) != "undefined") {
            if (object._H != null && typeof (object._H) != "undefined") {
                this.height = object._H;
            }
            if (object._W != null && typeof (object._W) != "undefined") {
                this.width = object._W;
            }
            if (object._L != null && typeof (object._L) != "undefined") {
                this.length = object._L;
            }
            if (object._X != null && typeof (object._X) != "undefined") {
                this.x = object._X;
            }
            if (object._Y != null && typeof (object._Y) != "undefined") {
                this.y = object._Y;
            }
            if (object._Z != null && typeof (object._Z) != "undefined") {
                this.z = object._Z;
            }
            if (object.index != null && typeof (object.index) != "undefined") {
                this.index = object.index;
            }
        }
    }
}
/**
 * updated 26.04.2019
 * the class represents a good that is putted into a container
 */
class Good extends Drawable {
    /**
     * updated 26.04.2019
     * the constructor creates a new instance of a good
     */
    constructor(object) {
        super();
        this.id = generateId();
        this.height = null;
        this.width = null;
        this.length = null;
        this.x = null;
        this.y = null;
        this.z = null;
        this.rotateable = false;
        this.stackable = false;
        this.isRotated = false;
        this.group = null;
        this.desc = null;
        if (object != null && typeof (object) != "undefined") {
            if (object._Height != null && typeof (object._Height) != "undefined") {
                this.height = object._Height;
            }
            if (object._Width != null && typeof (object._Width) != "undefined") {
                this.width = object._Width;
            }
            if (object._Length != null && typeof (object._Length) != "undefined") {
                this.length = object._Length;
            }
            if (object._X != null && typeof (object._X) != "undefined") {
                this.x = object._X;
            }
            if (object._Y != null && typeof (object._Y) != "undefined") {
                this.y = object._Y;
            }
            if (object._Z != null && typeof (object._Z) != "undefined") {
                this.z = object._Z;
            }
            if (object._Group != null && typeof (object._Group) != "undefined") {
                this.group = object._Group;
            }
            if (object._Desc != null && typeof (object._Desc) != "undefined") {
                this.desc = object._Desc;
            }
            if (object._Stack != null && typeof (object._Stack) != "undefined") {
                this.stackable = object._Stack;
            }
            if (object._Rotate != null && typeof (object._Rotate) != "undefined") {
                this.rotateable = object._Rotate;
            }
        }
    }
    /**
     * updated 26.04.2019
     * the method returns the total volume of the container
     */
    getTotalVolume() {
        return this.height * this.width * this.length;
    }
    /**
     * updated 27.04.2019
     * the method generates a detailed preview of the good
     */
    generateDetailsLabel() {
        var html = "<table><tr><td><i class='material-icons speaking-android'>android</i></td><td><div class='speech-bubble'>Das Frachtstück " + this.desc + " gehört zu der Gruppe " + this.group + ". Für die folgenden Eigenschaften habe ich die folgenden Koordinaten berechnet:<table class='speech-bubble-table'><tbody><tr><td>Länge:</td><td class='after-m'>" + Styler.styleM(this.length) + "</td></tr><tr><td>Breite:</td><td class='after-m'>" + Styler.styleM(this.width) + "</td></tr><tr><td>Höhe:</td><td class='after-m'>" + Styler.styleM(this.height) + "</td></tr><tr><td>Z-Koordinate (Länge):</td><td class='after-m'>" + Styler.styleM(this.z) + "</td></tr><tr><td>X-Koordinate (Tiefe):</td><td class='after-m'>" + Styler.styleM(this.x) + "</td></tr><tr><td>Y-Koordinate (Höhe):</td><td class='after-m'>" + Styler.styleM(this.y) + "</td></tr></tbody></table>";
        if(this.isRotated){
            html += "das Gut wurde um die vertikale Achse rotiert";
        } else {
            html += "das Gut wurde nicht um die vertikale Achse rotiert";
        }
        html += "</div></td></tr></table>";
        return html;
    }
    /**
     * updated 16.05.2019
     * the method returns the instance's server object
     */
    toServerObject() {
        return {
            _Desc: this.desc,
            _Height: this.height,
            _Group: this.group,
            _Width: this.width,
            _Length: this.length,
            _Rotate: this.rotateable,
            _Stack: this.stackable,
            _X: this.x,
            _Y: this.y,
            _Z: this.z
        };
    }
}
/**
 * updated 26.04.2019
 * the class represents an input given by the user
 */
class Input {
    /**
     * updated 26.04.2019
     * the constructor creates a new instance of an input
     */
    constructor() {
        this.cW = 0;
        this.cH = 0;
        this.fileHeadline = [];
        this.orders = [];
    }
    /**
     * updated 28.04.2019
     * the method creates the input's content table
     */
    addListeners() {
        if (!$("#cicw").hasClass("click-event-added")) {
            $("#cicw").addClass("click-event-added");
            $("#cicw").on("keyup", function () {
                runtimeManager.input.cW = parseInt($(this).val());
            });
        }
        if (!$("#cich").hasClass("click-event-added")) {
            $("#cich").addClass("click-event-added");
            $("#cich").on("keyup", function () {
                runtimeManager.input.cH = parseInt($(this).val());
            });
        }
        this.tab = new SortableTable({
            customClass: "orders-table",
            headline: [
                { name: "", sortable: false, attr: null },
                { name: "Bestellung", sortable: true, attr: "order" },
                { name: "Beschreibung", sortable: true, attr: "desc" },
                { name: "Quantität", sortable: true, attr: "quantity" },
                { name: "Länge", sortable: true, attr: "length" },
                { name: "Breite", sortable: true, attr: "width" },
                { name: "Höhe", sortable: true, attr: "height" },
                { name: "Drehbar", sortable: true, attr: "rotate" },
                { name: "Stapelbar", sortable: true, attr: "stack" },
                { name: "Gruppe", sortable: true, attr: "group" }
            ],
        }, this);
        $("#user-input").append(this.tab.generate());
        this.tab.addListener();
        this.tab.fillContent(this.orders);
    }
    /**
     * updated 26.04.2019
     * the method sets the attriubtes of the input request according to the user's input
     */
    fromCSV(text) {
        var rows = text.split("\n");
        for (var index in rows) {
            if (rows[index] != "") {
                var array = rows[index].split(",");
                if (index == 1) {
                    // Container Width, Container Heigth
                    this.cW = array[0];
                    this.cH = array[1];
                } else if (index == 2) {
                    for (var cellIndex in array) {
                        console.log(array[cellIndex]);
                        this.fileHeadline.push(array[cellIndex]);
                    }
                } else if (index > 2) {
                    var o = new InputOrder();
                    o.order = parseInt(array[0]);
                    o.desc = array[1].toString();
                    o.quantity = parseInt(array[2]);
                    o.length = parseFloat(array[3]);
                    o.width = parseFloat(array[4]);
                    o.height = parseFloat(array[5]);
                    if (parseInt(array[6]) === 1) {
                        o.rotate = true;
                    } else {
                        o.rotate = false;
                    }
                    if (parseInt(array[7]) === 1) {
                        o.stack = true;
                    } else {
                        o.stack = false;
                    }
                    o.group = parseFloat(array[8]);
                    this.orders.push(o);
                }
            }
        }
    }
    /**
     * updated 26.04.2019
     * the method generates the current instances detail's label
     */
    generateDetailsLabel() {
        var id = generateId();
        var html = "<div id='" + id + "'><table class='user-input-tab'><tbody><tr><td>Breite des Containers</td><td class='input'><input class='user-input' type='text' id='cicw' value='" + this.cW + "' /></td><td rowspan='2'><div style='width: 300px; height: 130px; overflow-x: scroll; overflow-y: none; display: none;'></div></td></tr><tr><td>Höhe des Containers</td><td class='input'><input class='user-input' type='text' id='cich' value='" + this.cH + "' /></td></tr><tr><td colspan='2' class='fill-orders' ></td></tr></tbody></table></div>";
        return {
            html: html,
            id: id
        };
    }
    /**
     * updated 26.04.2019
     * the method returns if the input has a valid format
     */
    isValid() {
        if (this.cH == null || this.cH <= 0) {
            return {
                value: false,
                desc: "Die Höhe des Containers muss größer als 0 sein."
            };
        }
        if (this.cW == null || this.cW <= 0) {
            return {
                value: false,
                desc: "Die Breite des Containers muss größer als 0 sein."
            };
        }
        if (this.orders.length <= 0) {
            return {
                value: false,
                desc: "Es muss mindestens eine Bestellung vorhanden sein."
            };
        }
        return {
            value: true,
            desc: "Der Input scheint konsistent zu sein."
        };
    }
    /**
     * updated 26.04.2019
     * the method sends the current instance to the server
     */
    send() {
        var instance = this;
        var data = instance.toServerObject();
        $.ajax({
            type: "POST",
            url: "http://" + serverLocation + "/api/upload",
            contentType: "application/json",
            data: data,
            beforeSend: function () {
                console.log(instance);
            },
            success: function (result) {
                console.log(result);
                var s = new Solution(result);
                runtimeManager.addSolution(s);
            },
            error: function (result) {
                console.log(result);
            }
        });
    }
    /**
     * updated 26.04.2019
     * the method converts the current instance to a valid server object
     */
    toServerObject() {
        return JSON.stringify({
            "_ContainerHeight": parseFloat(this.cH),
            "_ContainerWidth": parseFloat(this.cW),
            "_Orders": InputOrder.listToServerObjects(this.orders)
        });
    }
}
/**
 * updated 26.04.2019
 * the class represents an customer's order represented by the user's input
 */
class InputOrder {
    /**
     * updated 26.04.2019
     * the constructor creates a new instance of an order
     */
    constructor() {
        this.order = null;
        this.desc = null;
        this.quantity = null;
        this.length = null;
        this.width = null;
        this.height = null;
        this.rotate = null;
        this.stack = null;
        this.group = null;
    }
    /**
     * updated 26.04.2019
     * the method adds the listeners for the generated list view
     */
    addExplorerListener(id, t) {
        var instance = this;
        $("#" + t + " .bordered").each(function () {
            if (!$(this).hasClass("keyup-event-added")) {
                $(this).addClass("keyup-event-added");
                $(this).on("keyup", function () {
                    var attr = $(this).data("attr");
                    var v = $(this).text();
                    if (v === "true") { v = true } else if (v === "false") { v = false }
                    instance[attr] = v;
                });
            }
        });
    }
    /**
     * updated 26.04.2019
     * the method generates the list view content
     */
    generateListView(headline, idx) {
        var id = generateId();
        var html = "<tr id='" + id + "' class='overview-row' data-id='" + this.order + "'><td class='index'>" + idx + "</td>";
        for (var index in headline) {
            var a = headline[index];
            if (a.attr != null) {
                var p = prettyAttributes.find(x => x.attr == a.attr);
                var ph = "";
                if (typeof (p) != "undefined" && p != null) {
                    ph = p.placeholder;
                } else {
                    ph = a.attr;
                }
                if (this[a.attr] != null && typeof (this[a.attr]) != "undefined") {
                    var v = this[a.attr];
                    if (v === true) { v = 1 } else if (v === false) { v = 0 }
                    html += "<td class='bordered' data-attr='" + a.attr + "' placeholder='" + ph + "' data-value='" + v + "' contenteditable>" + this[a.attr] + "</td>";
                } else {
                    html += "<td class='bordered' data-attr='" + a.attr + "' placeholder='" + ph + "' data-value='0' contenteditable></td>";
                }
            }
        }
        html += "</tr>";
        return {
            html: html,
            id: id
        };
    }
    /**
     * updated 26.04.2019
     * the method generates a set of server objects for a list of given data
     */
    static listToServerObjects(array) {
        var output = [];
        for (var index in array) {
            output.push(array[index].toServerObject());
        }
        return output;
    }
    /**
     * updated 26.04.2019
     * the method converts the current instance to a valid server object
     */
    toServerObject() {
        return {
            "_Id": parseFloat(this.order),
            "_Description": this.desc,
            "_Quantity": parseInt(this.quantity),
            "_Length": parseFloat(this.length),
            "_Width": parseFloat(this.width),
            "_Height": parseFloat(this.height),
            "_Rotate": this.rotate,
            "_Stack": this.stack,
            "_Group": parseInt(this.group)
        };
    }
}
/**
 * updated 26.04.2019
 * groups devides a set of goods
 */
class Groups {
    /**
     * updated 26.04.2019
     * the constructor creates a new instance of a group
     */
    constructor(object) {
        this.id = null;
        this.color = "grey";
        if (object != null && typeof (object) != "undefined") {
            if (object._Id != null && typeof (object._Id) != "undefined") {
                this.id = object._Id;
            }
            if (object._Color != null && typeof (object._Color) != "undefined") {
                this.color = object._Color;
            }
        }
    }
    /**
     * updated 28.04.2019
     * the method adds the event listeners to the preview labels
     */
    addLabelListeners(id) {
        var instance = this;
        if (!$("#" + id).hasClass("change-event-added")) {
            $("#" + id).addClass("change-event-added");
            $("#" + id).on("change", function () {
                instance.color = $(this).val();
                scene.children.forEach(function (child) {
                    if (child.groupId == instance.id) {
                        child.groupColor = instance.color;
                        child.material.color = new THREE.Color(instance.color);
                    }
                });
            });
        }
    }
    /**
     * updated 28.04.2019
     * the method generates a preview label for the group
     */
    generateLabel() {
        var id = generateId();
        var html = "<div class='grop-preview'><input type='color' value='" + this.color + "' id='" + id + "' />Gruppe " + this.id + "</div>";
        return {
            html: html,
            id: id
        };
    }
    /**
     * updated 16.05.2019
     * the method generates the instances server object
     */
    toServerObject() {
        return {
            _Color: this.color,
            _Id: this.id
        };
    }
}
/**
 * updated 26.04.2019
 * the manager controls the current runtime
 */
class RuntimeManager {
    /**
     * updated 26.04.2019
     * the constructor generates a new instance of the runtime manager
     */
    constructor() {
        this.drawEmpty = false;
        this.emptyIndex = 0;
        this.renderEmptyIndex = false;
        this.solutions = [];
        this.groups = [];
        this.windowState = 0;
        this.input = null;
        this.init();
        this.socketConn = new Socket();
        this.mousePosition = new THREE.Vector3(0, 0, 0);
        this.currentGridUUID = null;
    }
    /**
     * updated 26.04.2019
     * the method adds a new calculated solution to the current runtime
     */
    addSolution(solution) {
        this.solutions.push(solution);
        this.setWindowState(1);
        solution.container.draw();
        $("#current-solution > *").not(".fixed").remove();
        var content = solution.generateDetailsLabel();
        $("#current-solution").prepend(content.html);
        solution.addDetailsListeners(content.id);
        $("#current-groups").empty();
        for (var index in runtimeManager.groups) {
            var content = runtimeManager.groups[index].generateLabel();
            $("#current-groups").append(content.html);
            runtimeManager.groups[index].addLabelListeners(content.id);
        }
        solution.validateChart();
    }
    /**
     * updated 26.04.2019
     * the method inits basic behaviour of the application
     */
    init() {
        var instance = this;
        $(window).dblclick(function () {
            console.log(instance, camera);
        });
        $(window).on("resize", function () {
            var height = parseFloat($(window).height()) - parseFloat($("#navbar").height());
            var width = parseFloat($(window).width()) - parseFloat($("#details").width());
            $("#solution-preview").css("height", height);
            $("#solution-preview").css("width", width);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        $(".section-invoker").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    var t = "#" + $(this).data("target");
                    if ($(t).is(":visible")) {
                        $(t).hide("blind", 500);
                        $(this).find(".material-icons").text("chevron_right");
                    } else {
                        $(t).show("blind", 500);
                        $(this).find(".material-icons").text("expand_more");
                    }
                });
            }
        });
        $(".empty-space-control-icon").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {

                });
            }
        });
        if (!$("#send-input").hasClass("click-event-added")) {
            $("#send-input").addClass("click-event-added");
            $("#send-input").click(function () {
                var valid = instance.input.isValid();
                if (valid.value) {
                    instance.input.send();
                } else {
                    alert(valid.desc);
                }
            });
        }
        if (!$("#ext-solution").hasClass("click-event-added")) {
            $("#ext-solution").addClass("click-event-added");
            $("#ext-solution").click(function () {
                $("#upload-ext-sol").trigger("click");
            });
        }
        if (!$("#add-dataset").hasClass("click-event-added")) {
            $("#add-dataset").addClass("click-event-added");
            $("#add-dataset").click(function () {
                var o = new InputOrder();
                instance.input.orders.push(o);
                instance.input.tab.append(o);
            });
        }
        $("#graphic-control-panel .material-icons").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function (e) {
                    e.stopPropagation();
                    var a = $(this).data("action");
                    switch (a) {
                        case "zoom-in":
                            camera.fov -= 1;
                            camera.updateProjectionMatrix();
                            break;
                        case "zoom-out":
                            camera.fov += 1;
                            camera.updateProjectionMatrix();
                            break;
                        case "upwards":
                            camera.position.y += 100;
                            camera.updateProjectionMatrix();
                            break;
                        case "right":
                            camera.position.x += 100;
                            camera.updateProjectionMatrix();
                            break;
                        case "downwards":
                            camera.position.y -= 100;
                            camera.updateProjectionMatrix();
                            break;
                        case "left":
                            camera.position.x -= 100;
                            camera.updateProjectionMatrix();
                            break;
                        case "defaultview":
                            var t = 100;
                            var interval = 10;
                            Styler.moveThreeJSCamera(t, interval, 45, 3000, 0, 4000);
                            break;
                        case "hide-grid":
                            if (runtimeManager.currentGridUUID != null) {
                                var g = scene.children.find(x => x.uuid == runtimeManager.currentGridUUID);
                                if (g.visible) {
                                    g.visible = false;
                                } else {
                                    g.visible = true;
                                }
                            }
                            break;
                        case "from-top":
                            var t = 100;
                            var interval = 10;
                            Styler.moveThreeJSCamera(t, interval, 45, -1, 10000, -1);
                            break;
                        case "from-side":
                            var t = 100;
                            var interval = 10;
                            Styler.moveThreeJSCamera(t, interval, 45, 10000, 1, 1);
                            break;
                    }
                });
            }
        });
        $("#graphic-inner").on("mousemove", function (e) {
            if (e.target.id === "solution-preview") {
                var left = parseFloat($(e.target).offset().left);
                var top = parseFloat($(e.target).offset().top);
                instance.mousePosition.x = ((e.clientX - left) / e.target.offsetWidth) * 2 - 1;
                instance.mousePosition.y = - ((e.clientY - top) / e.target.offsetHeight) * 2 + 1;
                scene.children.forEach(function (child) {
                    if (child.material != null && typeof (child.material) != "undefined") {
                        child.material.color.set(child.groupColor);
                    }
                });
                var direction = new THREE.Vector3().copy(runtimeManager.mousePosition).unproject(camera).sub(camera.position).normalize();
                ray.set(camera.position, direction);
                var intersects = ray.intersectObjects(scene.children);
                var found = null;
                intersects.forEach(function (object) {
                    if (object.object instanceof THREE.Mesh) {
                        if (found == null || found.distance > object.distance) {
                            found = object;
                        }
                    }
                });
                if (found != null) {
                    found.object.material.color.set("white");
                }
            }
        });
        $("#graphic-inner").on("mouseleave", function (e) {
            scene.children.forEach(function (child) {
                if (child.material != null && typeof (child.material) != "undefined") {
                    child.material.color.set(child.groupColor);
                }
            });
        });
        $("#graphic-inner").on("click", function (e) {
            if (e.target.id === "solution-preview") {
                var left = parseFloat($(e.target).offset().left);
                var top = parseFloat($(e.target).offset().top);
                instance.mousePosition.x = ((e.clientX - left) / e.target.offsetWidth) * 2 - 1;
                instance.mousePosition.y = - ((e.clientY - top) / e.target.offsetHeight) * 2 + 1;
                scene.children.forEach(function (child) {
                    if (child.material != null && typeof (child.material) != "undefined") {
                        child.material.color.set(child.groupColor);
                    }
                });
                var direction = new THREE.Vector3().copy(runtimeManager.mousePosition).unproject(camera).sub(camera.position).normalize();
                ray.set(camera.position, direction);
                var intersects = ray.intersectObjects(scene.children);
                var found = null;
                intersects.forEach(function (object) {
                    if (object.object instanceof THREE.Mesh) {
                        if (found == null || found.distance > object.distance) {
                            found = object;
                        }
                    }
                });
                if (found != null) {
                    found.object.material.color.set("white");
                    var good = instance.solutions[0].container.goods.find(x => x.id == found.object.goodId);
                    if (typeof (good) != "undefined") {
                        $("#detailed-good-panel").empty();
                        $("#detailed-good-panel").append(good.generateDetailsLabel());
                        $("#detailed-good-panel").show("blind", 500);
                    }
                }
            }
        });
        $("[data-action='upload-current-config']").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    $("#upload-file").trigger("click");
                });
            }
        });
        $("[data-action='upload-solution']").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    $("#upload-sol").trigger("click");
                });
            }
        });
        $("[data-action='back-to-input']").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    runtimeManager.setWindowState(0);
                });
            }
        });
        $("[data-action='show-empty']").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    runtimeManager.toggleEmptySpace();
                });
            }
        });
        $("[data-action='show-goods']").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    runtimeManager.toggleEmptySpace();
                });
            }
        });
        if (!$("#upload-file").hasClass("click-event-added")) {
            $("#upload-file").addClass("click-event-added");
            $("#upload-file").on("change", function () {
                var file = $(this)[0].files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    var i = new Input();
                    i.fromCSV(reader.result);
                    instance.setInput(i);
                }
                reader.readAsText(file);
            });
        }
        if (!$("#upload-ext-sol").hasClass("click-event-added")) {
            $("#upload-ext-sol").addClass("click-event-added");
            $("#upload-ext-sol").on("change", function () {
                var file = $(this)[0].files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    var rows = reader.result.split("\n");
                    var goods = [];
                    var groups = [];
                    var length = 0;
                    for (var index in rows) {
                        if (index > 0 && rows[index] != null && rows[index] != "") {
                            var g = new Good();
                            var cellArray = rows[index].split(",");
                            var o = runtimeManager.input.orders.find(x => x.order === parseInt(cellArray[0]));
                            g.group = parseInt(o.group);
                            g.x = parseInt(cellArray[1]);
                            g.y = parseInt(cellArray[2]);
                            g.z = parseInt(cellArray[3]);
                            if (cellArray[4] == 1) {
                                g.isRotated = true;
                            } else {
                                g.isRotated = false;
                            }
                            g.height = o.height;
                            g.width = o.width;
                            g.length = o.length;
                            g.desc = o.desc;
                            g.rotateable = o.rotate;
                            g.stackable = o.stack;
                            goods.push(g);
                            if (typeof (groups.find(x => x.id)) == "undefined") {
                                var gr = new Groups();
                                gr.id = g.group;
                                gr.color = RuntimeManager.randomColor;
                                groups.push(gr);
                            }
                            if ((g.z + g.length) > length) {
                                length = (g.z + g.length);
                            }
                        }
                    }
                    runtimeManager.groups = groups;
                    var c = new Container();
                    c.length = length;
                    c.height = runtimeManager.input.cH;
                    c.width = runtimeManager.input.cW;
                    c.goods = goods;
                    var s = new Solution();
                    s.container = c;
                    s.algorithm = "Unbekannter Algorithmus aus Exportdatei";
                    runtimeManager.addSolution(s);
                }
                reader.readAsText(file);
            });
        }
        if (!$("#upload-sol").hasClass("click-event-added")) {
            $("#upload-sol").addClass("click-event-added");
            $("#upload-sol").on("change", function () {
                var file = $(this)[0].files[0];
                var reader = new FileReader();
                var extension = file.name.split('.').pop().toLowerCase();
                reader.onload = function (e) {
                    switch (extension) {
                        case "json":
                            var o = JSON.parse(reader.result);
                            var s = new Solution(o);
                            runtimeManager.addSolution(s);
                            break;
                        default:
                            throw ("unsupported extension error");
                    }
                }
                reader.readAsText(file);
            });
        }
        this.setInput(new Input());
    }
    /**
     * updated 28.04.2019
     * the method loads the example data (.csv)
     */
    loadExamples() {
        $.ajax({
            type: "GET",
            url: "data",
            success: function (result) {
                console.log(result);
            },
            error: function (result) {
                console.log(result);
            }
        });
    }
    /**
     * updated 18.05.2019
     * the method returns a random color string
     */
    static get randomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    /**
     * updated 26.04.2019
     * the method sets a complete set of a user's input
     */
    setInput(input) {
        this.input = input;
        this.setWindowState(0);

    }
    /**
     * updated 26.04.2019
     * the method sets the current window state
     */
    setWindowState(state) {
        this.windowState = state;
        switch (state) {
            case 0:
                $("#user-input").show();
                $("#details").hide();
                $("#graphic").hide();
                $(".footer-row").show();
                $("#user-input").empty();
                $(".nav-item[data-action='back-to-input']").hide();
                var content = this.input.generateDetailsLabel();
                $("#user-input").append(content.html);
                this.input.addListeners();
                if (this.input.isValid().value) {
                    $("#send-input").removeClass("disabled");
                    $("#ext-solution").css("display", "inline-block");
                } else {
                    $("#send-input").addClass("disabled");
                    $("#ext-solution").css("display", "none");
                }
                this.loadExamples();
                break;
            case 1:
                $(".nav-item[data-action='back-to-input']").show();
                $("#user-input").hide();
                $("#details").show();
                $("#graphic").show();
                $(".footer-row").hide();
                /*
                if (runtimeManager.solutions[0].empty.length > 0) {
                    $(".nav-item[data-action='show-empty']").show();
                }
                */
                break;
        }
    }
    /**
     * updated 20.06.2019
     * the method toggles the empty space visualization
     */
    toggleEmptySpace() {
        if (this.drawEmpty) {
            this.drawEmpty = false;
            $(".nav-item[data-action='show-empty']").show();
            $(".nav-item[data-action='show-goods']").hide();
        } else {
            this.drawEmpty = true;
            $(".nav-item[data-action='show-empty']").hide();
            $(".nav-item[data-action='show-goods']").show();
        }
        this.solutions[0].container.draw();
    }
}
/**
 * updated 26.04.2019
 * a solution contains a 
 */
class Solution {
    /**
     * updated 26.04.2019
     * the constructor creates a new instance of a solution
     */
    constructor(object) {
        this.container = null;
        this.algorithm = "";
        this.empty = [];
        if (object != null && typeof (object) != "undefined") {
            if (object._Container != null && typeof (object._Container) != "undefined") {
                this.container = new Container(object._Container);
            }
            if (object._Algorithm != null && typeof (object._Algorithm) != "undefined") {
                this.algorithm = object._Algorithm;
            }
            if (object._Groups != null && typeof (object._Groups) != "undefined") {
                runtimeManager.groups = [];
                for (var index in object._Groups) {
                    runtimeManager.groups.push(new Groups(object._Groups[index]));
                }
            }
            if (object._Empty != null && typeof (object._Empty) != "undefined") {
                for (var index in object._Empty) {
                    this.empty.push(new Empty(object._Empty[index]));
                }
            }
        }
    }
    /**
     * updated 16.05.2019
     * the method adds the solution's details label
     */
    addDetailsListeners(id) {
        if (!$("#" + id + " .button[data-target='download-solution']").hasClass("click-event-added")) {
            $("#" + id + " .button[data-target='download-solution']").addClass("click-event-added");
            $("#" + id + " .button[data-target='download-solution']").click(function () {
                download(JSON.stringify(runtimeManager.solutions[0].toServerObject()), "solution.json", "application/json");
            });
        }
        if (!$("#" + id + " .button[data-target='export-solution']").hasClass("click-event-added")) {
            $("#" + id + " .button[data-target='export-solution']").addClass("click-event-added");
            $("#" + id + " .button[data-target='export-solution']").click(function () {
                download(runtimeManager.solutions[0].toExport(), "export.csv", "text/csv");
            });
        }
    }
    /**
     * updated 26.04.2019
     * the method generates the html code for the current solution
     */
    generateDetailsLabel() {
        var id = generateId();
        var html = "<table id='" + id + "' class='details-table st-mgr-tab'><tbody><tr><td>Gesamtes Containervolumen</td><td class='after-m3'>" + Styler.styleCubicM(this.container.getTotalVolume()) + "</td></tr><tr><td>Davon besetztes Volumen</td><td class='after-m3'>" + Styler.styleCubicM(this.container.getUsedVolume()) + "</td></tr><tr><td>Davon ungenutztes Volumen</td><td class='after-m3'>" + Styler.styleCubicM(this.container.getUnUsedVolume()) + "</td></tr><tr><td>Enthaltene Paletten</td><td>" + this.container.goods.length + "</td></tr><tr><td>Länge des Containers</td><td class='after-m'>" + Styler.styleM(this.container.length) + "</td></tr><tr><td>Höhe des Containers</td><td class='after-m'>" + Styler.styleM(this.container.height) + "</td></tr><tr><td>Breite des Containers</td><td class='after-m'>" + Styler.styleM(this.container.width) + "</td></tr><tr class='no-style'><td colspan='2'><button class='button' data-target='download-solution'><i class='material-icons icon'>save_alt</i>Lösung herunterladen (.json)</button></td></tr><tr><td colspan='2'><button class='button' data-target='export-solution'><i class='material-icons icon'>reply</i>Lösung exportieren (.csv)</button></td></tr><tr><td colspan='2'><button class='button' data-target='go-back'><i class='material-icons icon'>arrow_back</i>Zurück zur Eingabe</button></td></tr></tbody></table>";
        return {
            html: html,
            id: id
        };
    }
    /**
     * updated 18.05.2019
     * the method parses the instance to the given export format
     */
    static fromExport(csvInput) {
        var rows = csvInput.split("\n");
        var container = new Container();
        for (var index in rows) {

        }
    }
    /**
     * updated 18.05.2019
     * the method converts the solution to the export format
     */
    toExport() {
        var output = "Order,xPos,yPos,zPos,HTurned\n";
        for (var index in this.container.goods) {
            var g = this.container.goods[index];
            var r = 0;
            if (g.isRotated) {
                r = 1;
            }
            output += g.group + "," + g.x + "," + g.y + "," + g.z + "," + r + "\n";
        }
        return output;
    }
    /**
     * updated 16.05.2019
     * the method returns the solutions server object
     */
    toServerObject() {
        var groups = [];
        for (var index in runtimeManager.groups) {
            groups.push(runtimeManager.groups[index].toServerObject());
        }
        return {
            _Container: this.container.toServerObject(),
            _Algorithm: this.algorithm,
            _Groups: groups
        };
    }
    /**
     * updated 26.04.2019
     * the method validates the current solutions load percentage
     */
    validateChart() {
        var used = this.container.getUsedVolume();
        var total = this.container.getTotalVolume();
        var a = parseInt(used / total * 100);
        var b = 100 - a;
        var ctx = document.getElementById("current-load").getContext("2d");
        var myChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Genutzes Volumen %", "Freiräume %"],
                datasets: [{
                    label: "Anteil",
                    data: [a, b],
                    backgroundColor: [
                        "rgba(62, 145, 72, .6)",
                        "rgba(150, 150, 150, .6)"
                    ],
                    borderColor: [
                        "rgb(62, 145, 72)",
                        "rgb(150, 150, 150)"
                    ]
                }]
            },
            options: {
                legend: {
                    position: "bottom"
                },
                borderWidth: 0
            }
        });
    }
}
/**
 * updated 27.04.2019
 * the class styles artifacts
 */
class Styler {
    /**
     * updated 27.04.2019
     * the method styles the input (mm³) to m³
     */
    static styleCubicM(input) {
        return parseFloat(input / 1000000000).toFixed(3).toString().replace(".", ",");
    }
    /**
     * updated 27.04.2019
     * the method styles the input (mm) to m
     */
    static styleM(input) {
        return parseFloat(input / 1000).toFixed(2).toString().replace(".", ",");
    }
    /**
     * updated 27.04.2019
     * the method controls the three js camera and animates a flight (t = steps, interval)
     */
    static moveThreeJSCamera(t, interval, zoom, x, y, z) {
        var o = window.setInterval(moveCamera, interval);
        var counter = 0;
        var deltaZoom = camera.fov - zoom;
        var deltaX = camera.position.x - x;
        var deltaY = camera.position.y - y;
        var deltaZ = camera.position.z - z;
        function moveCamera() {
            camera.position.x -= deltaX / t;
            camera.position.y -= deltaY / t;
            camera.position.z -= deltaZ / t;
            camera.fov -= deltaZoom / t;
            camera.updateProjectionMatrix();
            if (counter == t) {
                clearInterval(o);
            } else {
                counter++;
            }
        }
    }
}
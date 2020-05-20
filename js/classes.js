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
        var length = this.corrLength;
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
                var geometry = new THREE.BoxGeometry(this.corrWidth, this.height, length, 4, 4, 4);
                var material = new THREE.MeshBasicMaterial({ color: color });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.groupColor = color;
                this.mesh.groupId = groupId;
                this.mesh.seqNr = this.seqNr;
                this.mesh.goodId = this.id;
                helper = new THREE.EdgesHelper(this.mesh, 0x333333);
                helper.material.linewidth = 1;
                this.helper = helper;
                break;
        }
        if (this.mesh != null) {
            if (parentDimension == null) {
                this.mesh.position.x = this.x;
                this.mesh.position.y = this.y;
                this.mesh.position.z = this.z;
            } else {
                this.mesh.position.z = this.z - (parentDimension.l / 2) + (length / 2);
                this.mesh.position.x = this.x - (parentDimension.w / 2) + (this.corrWidth / 2);
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
     * updated 26.07.2019
     * the method returns the corrected length of the instance
     */
    get corrLength() {
        return this.length;
    }
    /**
     * updated 26.07.2019
     * the method returns the corrected width of the instance
     */
    get corrWidth() {
        return this.width;
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
        for (var index in this.goods) {
            var g = this.goods[index];
            g.draw({ h: this.height, w: this.width, l: this.length }, { type: "filled" });
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
        this.seqNr = null;
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
            if (object._IsRotated != null && typeof (object._IsRotated) != "undefined") {
                this.isRotated = object._IsRotated;
            }
            if (object._SequenceNr != null && typeof (object._SequenceNr) != "undefined") {
                this.seqNr = object._SequenceNr;
            }
        }
    }
    /**
     * updated 26.07.2019
     * the method returns the corrected length of the instance
     */
    get corrLength() {
        if (this.isRotated) {
            return this.width;
        }
        return this.length;
    }
    /**
     * updated 26.07.2019
     * the method returns the corrected width of the instance
     */
    get corrWidth() {
        if (this.isRotated) {
            return this.length;
        }
        return this.width;
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
        var html = "<table><tr><td><i class='material-icons speaking-android'>android</i></td><td><div class='speech-bubble'>Das Frachtstück " + this.desc + " gehört zu der Gruppe " + this.group + ". Für die folgenden Eigenschaften habe ich die folgenden Koordinaten berechnet:<table class='speech-bubble-table'><tbody><tr><td>Länge:</td><td class='after-m'>" + Styler.styleM(this.length) + "</td></tr><tr><td>Breite:</td><td class='after-m'>" + Styler.styleM(this.width) + "</td></tr><tr><td>Höhe:</td><td class='after-m'>" + Styler.styleM(this.height) + "</td></tr><tr><td>Z-Koordinate (Länge):</td><td class='after-m'>" + Styler.styleM(this.z) + "</td></tr><tr><td>X-Koordinate (Tiefe):</td><td class='after-m'>" + Styler.styleM(this.x) + "</td></tr><tr><td>Y-Koordinate (Höhe):</td><td class='after-m'>" + Styler.styleM(this.y) + "</td></tr><tr><td>Folgenummer</td><td>" + this.seqNr + "</td></tr></tbody></table>";
        if (this.isRotated) {
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
            _Z: this.z,
            _SequenceNr: this.seqNr
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
        this.algorithm = "SuperFlo";
    }
    /**
     * updated 28.04.2019
     * the method creates the input's content table
     */
    addListeners(id) {
        var instance = this;
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
        $("#" + id + " .algorithm-overview").each(function () {
            if (!$(this).hasClass("event-listener-added")) {
                $(this).addClass("event-listener-added");
                $(this).click(function () {
                    instance.selectAlgorithm(id, $(this).data("alg"));
                });
            }
        });
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
     * updated 04.08.2019
     * the method returns the average dimensions of the orders
     */
    get avgOrderDims(){
        var output = { tW: 0, tL: 0, tH: 0, avgW: 0, avgL: 0, avgH: 0, tO: 0 };
        for(var index in this.orders){
            output.tH += (this.orders[index].height * this.orders[index].quantity);
            output.tW += (this.orders[index].width * this.orders[index].quantity);
            output.tL += (this.orders[index].length * this.orders[index].quantity);
            output.tO += this.orders[index].quantity;
        }
        output.avgH = output.tH / output.tO;
        output.avgW = output.tW / output.tO;
        output.avgL = output.tL / output.tO;
        return output;
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
        var icon = "<i class='material-icons icon' style='display: none;'>done</i>";
        var iconS = "<i class='material-icons icon'>done</i>";
        var sub = "<span class='subtitle'>Algorithmus auswählen</span>";
        var subS = "<span class='subtitle'>Algorithmus ausgewählt</span>";
        var html = "<div id='" + id + "'><div class='approaches-overview' style='display: none; width: 100%;'>";
        if (this.algorithm == "AllInOneRow") {
            html += "<div class='algorithm-overview' data-alg='air'>" + iconS + "<span class='headline'>AllInOneRow</span>" + subS + "</div>";
        } else {
            html += "<div class='algorithm-overview' data-alg='air'>" + icon + "<span class='headline'>AllInOneRow</span>" + sub + "</div>";
        }
        if (this.algorithm == "StartLeftBottom") {
            html += "<div class='algorithm-overview' data-alg='slb'>" + iconS + "<span class='headline'>StartLeftBottom</span>" + subS + "</div>";
        } else {
            html += "<div class='algorithm-overview' data-alg='slb'>" + icon + "<span class='headline'>StartLeftBottom</span>" + sub + "</div>";
        }
        if (this.algorithm == "SuperFlo") {
            html += "<div class='algorithm-overview' data-alg='suf'>" + iconS + "<span class='headline'>SuperFlo</span>" + subS + "</div>";
        } else {
            html += "<div class='algorithm-overview' data-alg='suf'>" + icon + "<span class='headline'>SuperFlo</span>" + sub + "</div>";
        }
        html += "</div><table class='user-input-tab'><tbody><tr><td>Breite des Containers</td><td class='input'><input class='user-input' type='text' id='cicw' value='" + this.cW + "' /></td><td rowspan='2'><div style='width: 300px; height: 130px; overflow-x: scroll; overflow-y: none; display: none;'></div></td></tr><tr><td>Höhe des Containers</td><td class='input'><input class='user-input' type='text' id='cich' value='" + this.cH + "' /></td></tr><tr><td colspan='2' class='fill-orders' ></td></tr></tbody></table></div>";
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
     * updated 04.08.2019
     * the method returns the total number of orders
     */
    get totalOrderCount(){
        var output = 0;
        for(var index in this.orders) output += this.orders[index].quantity;
        return output;
    }
    /**
     * updated 26.07.2019
     * the method selects an algorithm
     */
    selectAlgorithm(id, code) {
        $("#" + id + " .algorithm-overview").each(function () {
            $(this).find(".icon").hide();
            $(this).find(".subtitle").text("Algorithmus auswählen");
        });
        $(".algorithm-overview[data-alg='" + code + "'] .icon").show();
        $(".algorithm-overview[data-alg='" + code + "'] .subtitle").text("Algorithmus ausgewählt");
        switch (code) {
            case "suf":
                this.algorithm = "SuperFlo";
                break;
            case "air":
                this.algorithm = "AllInOneRow";
                break;
            case "slb":
                this.algorithm = "StartLeftBottom";
                break;
            default: throw ("unknown algorithm code: " + code);
        }
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
            url: serverLocation + "/api/upload",
            contentType: "application/json",
            data: data,
            beforeSend: function () {
                console.log(instance);
            },
            success: function (result) {
                console.log("Input erfolgreich übermittelt");
            },
            error: function (result) {
                console.log(result);
            }
        });
    }
    /**
     * updated 04.08.2019
     * the method returns the standard deviation for the current set
     */
    get stOrderDev(){
        var output = { sdevW: 0, sdevL: 0, sdevH: 0, tO: 0, sumW: 0, sumL: 0, sumH: 0, tO: 0 };
        var avg = this.avgOrderDims;
        for(var index in this.orders){
            output.tO += this.orders[index].quantity;
            output.sumW += Math.pow((this.orders[index].width - avg.avgW), 2) * this.orders[index].quantity;
            output.sumL += Math.pow((this.orders[index].length - avg.avgL), 2) * this.orders[index].quantity;
            output.sumH += Math.pow((this.orders[index].height - avg.avgH), 2) * this.orders[index].quantity;
        }
        output.sdevW = Math.sqrt(output.sumW / output.tO);
        output.sdevL = Math.sqrt(output.sumL / output.tO);
        output.sdevH = Math.sqrt(output.sumH / output.tO);
        return output;
    }
    /**
     * updated 26.04.2019
     * the method converts the current instance to a valid server object
     */
    toServerObject() {
        return JSON.stringify({
            "_ContainerHeight": parseFloat(this.cH),
            "_ContainerWidth": parseFloat(this.cW),
            "_Orders": InputOrder.listToServerObjects(this.orders),
            "_Algorithm": this.algorithm
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
        this.solutions = [];
        this.solutionFlag = null;
        this.groups = [];
        this.windowState = 0;
        this.input = null;
        this.init();
        this.socketConn = new Socket();
        this.mousePosition = new THREE.Vector3(0.7, -0.25, 0);
        this.currentGridUUID = null;
        this.sim = { step: null, o: null, hideLatter: true, tempElements: [], simHelperRegularColor: new THREE.Color("rgb(255, 166, 0)"), simHelperInfinityLengthColor: new THREE.Color("rgb(7, 143, 25)"), simSumedUpColor: new THREE.Color("rgb(0, 255, 238)"), simRecursiveRestrictedColor: new THREE.Color("rgb(237, 26, 79)") };
    }
    /**
     * updated 26.04.2019
     * the method adds a new calculated solution to the current runtime
     */
    addSolution(solution) {
        this.solutions.push(solution);
        if (this.solutionFlag == null) {
            this.setSolution(solution.id);
        } else {
            var s = this.solutions.find(x => x.id == this.solutionFlag);
            if (s.container.length > solution.container.length) this.setSolution(solution.id);
        }
        var content = solution.generateOverviewLabel();
        $("#all-solutions").prepend(content.html);
        solution.addLabelListeners(content.id);
        if(this.solutions.length > 1){
            $("#compare-solutions").show();
        }
    }
    /**
     * updated 05.08.2019
     * the method clears the current instance
     */
    clear(){
        this.solutions = [];
        this.solutionFlag = null;
        $("#all-solutions > *").not("fixed").remove();
    }
    /**
     * updated 03.08.2019
     * the method returns the current solution
     */
    get currentSolution() {
        return this.solutions.find(x => x.id == this.solutionFlag);
    }
    /**
     * the method does the simulation for the setted step
     */
    doSimulation() {
        var s = this.solutions.find(x => x.id == this.solutionFlag);
        switch (this.sim.step) {
            case null:
                $("#simulation .counter").text("gestoppt");
                for (var index in s.container.goods) {
                    s.container.goods[index].mesh.visible = true;
                    s.container.goods[index].helper.material.color = new THREE.Color("rgb(0, 0, 0)");
                    s.container.goods[index].helper.visible = true;
                }
                break;
            default:
                $("#simulation .counter").text(this.sim.step + " von " + s.sequence);
                for (var index in s.container.goods) {
                    if (s.container.goods[index].seqNr == this.sim.step) {
                        s.container.goods[index].mesh.visible = true;
                        s.container.goods[index].helper.material.color = new THREE.Color("rgb(0, 0, 0)");
                        s.container.goods[index].helper.visible = true;
                    } else {
                        s.container.goods[index].mesh.visible = false;
                        if (this.sim.hideLatter && s.container.goods[index].seqNr > this.sim.step) {
                            s.container.goods[index].helper.visible = false;
                        } else {
                            s.container.goods[index].helper.material.color = new THREE.Color("rgb(89, 89, 89)");
                            s.container.goods[index].helper.visible = true;
                        }
                    }
                }
                var seqSt = s.getStepsForSequenceNumber(this.sim.step);
                if (seqSt != null) {
                    var parentDimension = {
                        h: s.container.height,
                        w: s.container.width,
                        l: s.container.length
                    };
                    for (var index in seqSt._Positions) {
                        var p = seqSt._Positions[index];
                        if (p._L == null) {
                            var l = 500;
                            var color = this.sim.simHelperRegularColor;
                        } else {
                            if (p._IsSumedUp) {
                                var color = this.sim.simSumedUpColor;
                            } else {
                                var color = this.sim.simHelperInfinityLengthColor;
                            }
                            var l = p._L;
                        }
                        var geometry = new THREE.BoxGeometry(p._W, p._H, l, 4, 4, 4);
                        var material = new THREE.MeshBasicMaterial({ color: color });
                        var mesh = new THREE.Mesh(geometry, material);
                        var helper = new THREE.EdgesHelper(mesh, 0x333333);
                        helper.material.linewidth = 1;
                        helper.material.color = color;
                        mesh.position.z = p._Z - (parentDimension.l / 2) + (l / 2);
                        mesh.position.x = p._X - (parentDimension.w / 2) + (p._W / 2);
                        mesh.position.y = p._Y - (parentDimension.h / 2) + (p._H / 2);
                        helper.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                        scene.add(helper);
                        this.sim.tempElements.push(helper);
                    }
                    for (var index in seqSt._RecursiveGroupRestricted) {
                        var p = seqSt._RecursiveGroupRestricted[index];
                        var l = p._L;
                        var color = this.sim.simRecursiveRestrictedColor;
                        var geometry = new THREE.BoxGeometry(p._W, p._H, l, 4, 4, 4);
                        var material = new THREE.MeshBasicMaterial({ color: color });
                        var mesh = new THREE.Mesh(geometry, material);
                        var helper = new THREE.EdgesHelper(mesh, 0x333333);
                        helper.material.linewidth = 1;
                        helper.material.color = color;
                        mesh.position.z = p._Z - (parentDimension.l / 2) + (l / 2);
                        mesh.position.x = p._X - (parentDimension.w / 2) + (p._W / 2);
                        mesh.position.y = p._Y - (parentDimension.h / 2) + (p._H / 2);
                        helper.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                        scene.add(helper);
                        this.sim.tempElements.push(helper);
                    }
                    renderer.render(scene, camera);
                }
                break;
        }
    }
    /**
     * updated 03.08.2019
     * the method fills the solution comparison
     */
    fillSolutionComparison(){
        var avg = runtimeManager.input.avgOrderDims;
        var svg = runtimeManager.input.stOrderDev;
        $("#solution-comparison").empty();
        $("#solution-comparison").append("<div style='display: flex; height: calc(100% - 111.6px);'><div style='flex-grow: 1;'><span style='display: block;text-decoration: underline #4e5b96; font-size: 1.4rem;'><i class='material-icons' style='margin-right: 10px; font-size: 1rem; color: #4e5b96;'>input</i>Angaben zum Dateninput</span><table style='font-size: .8rem;'><tr><td>Breite Container</td><td>" + parseFloat(runtimeManager.input.cW/1000).toFixed(2) + " m</td></tr><tr><td>Höhe Container</td><td>" + parseFloat(runtimeManager.input.cH/1000).toFixed(2) + " m</td></tr><tr><td>Anzahl Güter (insgesamt)</td><td>" + runtimeManager.input.totalOrderCount + " Stück</td></tr><tr><td>Anzahl Bestellungen</td><td>" + runtimeManager.input.orders.length + " Bestellungen</td></tr><tr><td>Anzahl Gruppen</td><td>" + runtimeManager.groups.length + " Gruppen</td></tr><tr><td>Durchschnittliche Güterbreite</td><td>" + parseFloat(avg.avgW/1000).toFixed(2) + " m</td></tr><tr><td>Standardabweichung Güterbreite</td><td>" + parseFloat(svg.sdevW/1000).toFixed(2) + " m</td></tr><tr><td></td><td>" + parseInt((svg.sdevW/avg.avgW) * 100) + " %</td></tr><tr><td>Durchschnittliche Güterhöhe</td><td>" + parseFloat(avg.avgH/1000).toFixed(2) + " m</td></tr><tr><td>Standardabweichung Güterhöhe</td><td>" + parseFloat(svg.sdevH/1000).toFixed(2) + " m</td></tr><tr><td></td><td>" + parseInt((svg.sdevH/avg.avgH) * 100) + " %</td></tr><tr><td>Durchschnittliche Güterlänge</td><td>" + parseFloat(avg.avgL/1000).toFixed(2) + " m</td></tr><tr><td>Standardabweichung Güterlänge</td><td>" + parseFloat(svg.sdevL/1000).toFixed(2) + " m</td></tr><tr><td></td><td>" + parseInt((svg.sdevL/avg.avgL) * 100) + " %</td></tr><tr></table></div><div class='diagram'><canvas id='solution-comparison-chart'></canvas></div>");
        var ctx = document.getElementById("solution-comparison-chart").getContext("2d");
        var labels = [];
        var clData = [];
        var cutilData = [];
        for(var index in this.solutions){
            var s = this.solutions[index];
            labels.push(s.algorithm);
            clData.push(parseInt(s.container.length/1000));
            cutilData.push(parseInt((s.container.getUsedVolume()/s.container.getTotalVolume())*100));
        }
        /**
         * backgroundColor: [
                        "rgba(170, 255, 51, .6)",
                        "rgba(150, 150, 150, .6)"
                    ],
                    borderColor: [
                        "rgb(126, 205, 16)",
                        "rgb(150, 150, 150)"
                    ]
         */
        var myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Länge des Containers",
                    yAxisID: "clData",
                    data: clData,
                    backgroundColor: "rgba(36, 142, 191, .5)",
                    borderColor: "rgb(36, 142, 191)",
                    type: "bar"
                }, {
                    label: "Prozentuale Auslastung des Containers",
                    yAxisID: "cutilData",
                    data: cutilData,
                    backgroundColor: "rgba(17, 168, 113, .5)",
                    borderColor: "rgb(17, 168, 113)",
                    type: "bar"
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        id: "clData",
                        type: "linear",
                        position: "left",
                        ticks: { beginAtZero: true }
                    }, {
                        id: "cutilData",
                        type: "linear",
                        position: "right",
                        ticks: { beginAtZero: true },
                        gridLines: { display: false }
                    }]
                },
                legend: {
                    position: "bottom"
                }
            }
        });
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
        $(window).on("keyup", function (e) {
            if (e.ctrlKey && e.which == 186) {
                e.preventDefault();
                e.stopPropagation();
                $("#simulation").toggle();
            }
        });
        $("#compare-solutions").click(function(){
            instance.setWindowState(2);
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
        $("#simulation .icon").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).each(function () {
                    $(this).click(function () {
                        instance.setSimulationStep($(this).data("action"));
                    });
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
                    instance.clear();
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
                            Styler.moveThreeJSCamera(t, interval, 45, 12000, 5000, 10000);
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
        $(".nav-item[data-action='leave']").each(function () {
            if (!$(this).hasClass("click-event-added")) {
                $(this).addClass("click-event-added");
                $(this).click(function () {
                    runtimeManager.setWindowState(1);
                });
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
        if (!$("#upload-file").hasClass("click-event-added")) {
            $("#upload-file").addClass("click-event-added");
            $("#upload-file").on("change", function () {
                var file = $(this)[0].files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    var i = new Input();
                    i.algorithm = instance.input.algorithm;
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
     * the method sets the current simulation step
     */
    setSimulationStep(step, auto) {
        var s = this.solutions.find(x => x.id == this.solutionFlag);
        var instance = this;
        for (var index in this.sim.tempElements) {
            scene.remove(this.sim.tempElements[index]);
        };
        if (auto !== true) {
            if (this.sim.o != null && step != "play") {
                clearInterval(this.sim.o);
                this.sim.o = null;
            }
        }
        switch (step) {
            case "stop":
                this.sim.step = null;
                $("#simulation .simulation-field .icon[data-action='play']").text("play_arrow");
                break;
            case "play":
                if (this.sim.o == null) {
                    if (this.sim.step == null) {
                        this.sim.step = 1;
                    }
                    this.sim.o = setInterval(function () {
                        instance.setSimulationStep("forward", true);
                    }, 1000);
                    $("#simulation .simulation-field .icon[data-action='play']").text("pause");
                } else {
                    clearInterval(this.sim.o);
                    this.sim.o = null;
                    $("#simulation .simulation-field .icon[data-action='play']").text("play_arrow");
                }
                break;
            case "back":
                if (this.sim.step == 1 || this.sim.step == null) {
                    this.sim.step = s.sequence;
                } else {
                    this.sim.step--;
                }
                break;
            case "forward":
                if (this.sim.step == s.sequence || this.sim.step == null) {
                    this.sim.step = 1;
                } else {
                    this.sim.step++;
                }
                break;
        }
        this.doSimulation();
    }
    /**
     * updated 03.08.2019
     * the method sets a solution for visualization
     */
    setSolution(id) {
        var solution = this.solutions.find(x => x.id == id);
        this.solutionFlag = id;
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
        $(".solution-checker").each(function () {
            if ($(this).data("solution") == id) {
                $(this).text("check_box");
                $(this).parent().addClass("active");
            } else {
                $(this).text("check_box_outline_blank");
                $(this).parent().removeClass("active");
            }
        });
        solution.validateChart();
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
                this.input.addListeners(content.id);
                if (this.input.isValid().value) {
                    $("#send-input").removeClass("disabled");
                    $("#ext-solution").css("display", "inline-block");
                } else {
                    $("#send-input").addClass("disabled");
                    $("#ext-solution").css("display", "none");
                }
                $("#solution-comparison").hide();
                $(".nav-item[data-action='leave']").hide();
                break;
            case 1:
                $(".nav-item[data-action='back-to-input']").show();
                $("#user-input").hide();
                $("#details").show();
                $("#graphic").show();
                $(".footer-row").hide();
                $("#solution-comparison").hide();
                $(".nav-item[data-action='leave']").hide();
                break;
            case 2:
                $(".nav-item[data-action='back-to-input']").hide();
                $("#user-input").hide();
                $("#details").hide();
                $("#graphic").hide();
                $(".footer-row").hide();
                $("#solution-comparison").show();
                $(".nav-item[data-action='leave']").show();
                this.fillSolutionComparison();
                break;
        }
    }
}
/**
 * updated 18.06.2019
 * the class connects the client with the server's web socket
 */
class Socket {
    /**
     * updated 18.06.2019
     * the constructor creates a new instance of a web socket
     */
    constructor() {
        this.url = serverLocation + "/signalr";
        this.connection = $.hubConnection(this.url, {
            useDefaultPath: false
        });
        this.notificationProxy = this.connection.createHubProxy("NotificationHub");
        this.allNotifications = [];
        this.observers = {
            onMessage: []
        };
        this.startConnection();
    }
    /**
     * updated 18.06.2019
     * the method starts the connection to the web socket
     */
    startConnection() {
        this.connection.start().done(function (e) {
            console.log(e);
        }).fail(function (e, f, g) {
            console.log(e, f, g);
        });
        this.notificationProxy.on("receiveSolution", function (s) {
            var sol = new Solution(s);
            console.log(sol);
            runtimeManager.addSolution(sol);
        });
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
        this.id = generateId();
        this.container = null;
        this.algorithm = null;
        this.empty = [];
        this.steps = null;
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
            if (object._Steps != null && typeof (object._Steps) != "undefined" && object._Steps.length > 0) {
                this.steps = object._Steps;
            }
            if (object._Duration != null && typeof (object._Duration) != "undefined") {
                this.duration = object._Duration;
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
                download(JSON.stringify(runtimeManager.currentSolution.toServerObject()), "solution.json", "application/json");
            });
        }
        if (!$("#" + id + " .button[data-target='export-solution']").hasClass("click-event-added")) {
            $("#" + id + " .button[data-target='export-solution']").addClass("click-event-added");
            $("#" + id + " .button[data-target='export-solution']").click(function () {
                download(runtimeManager.solutions[0].toExport(), "export.csv", "text/csv");
            });
        }
        if (!$("#" + id + " .button[data-target='go-back']").hasClass("click-event-added")) {
            $("#" + id + " .button[data-target='go-back']").addClass("click-event-added");
            $("#" + id + " .button[data-target='go-back']").click(function () {
                runtimeManager.setWindowState(0);
            });
        }
    }
    /**
     * updated 03.08.2019
     * the method adds the event listeners to the details label
     */
    addLabelListeners(id) {
        var instance = this;
        if (!$("#" + id).hasClass("click-event-added")) {
            $("#" + id).addClass("click-event-added");
            $("#" + id).click(function () {
                runtimeManager.setSolution(instance.id);
            });
        }
    }
    /**
     * updated 26.04.2019
     * the method generates the html code for the current solution
     */
    generateDetailsLabel() {
        var id = generateId();
        var html = "<div id='" + id + "'><table class='details-table st-mgr-tab'><tbody><tr><td>Verwendeter Algorithmus</td><td>" + this.algorithm + "</td></tr><tr><td>Berechnungsdauer</td><td>" + this.duration + " ms</td></tr><tr><td>Gesamtes Containervolumen</td><td class='after-m3'>" + Styler.styleCubicM(this.container.getTotalVolume()) + "</td></tr><tr><td>Davon besetztes Volumen</td><td class='after-m3'>" + Styler.styleCubicM(this.container.getUsedVolume()) + "</td></tr><tr><td>Davon ungenutztes Volumen</td><td class='after-m3'>" + Styler.styleCubicM(this.container.getUnUsedVolume()) + "</td></tr><tr><td>Enthaltene Paletten</td><td>" + this.container.goods.length + "</td></tr><tr><td>Länge des Containers</td><td class='after-m'>" + Styler.styleM(this.container.length) + "</td></tr><tr><td>Höhe des Containers</td><td class='after-m'>" + Styler.styleM(this.container.height) + "</td></tr><tr><td>Breite des Containers</td><td class='after-m'>" + Styler.styleM(this.container.width) + "</td></tr></tbody></table>";
        html += "<canvas id='current-load'></canvas>";
        html += "<button class='button' data-target='download-solution' data-index='0'><i class='material-icons icon'>save_alt</i>Lösung herunterladen (.json)</button><button class='button' data-target='export-solution' data-index='1'><i class='material-icons icon'>reply</i>Lösung exportieren (.csv)</button><button class='button' data-target='go-back' data-index='0'><i class='material-icons icon'>arrow_back</i>Zurück zur Eingabe</button></div>";
        return {
            html: html,
            id: id
        };
    }
    /**
     * updated 03.08.2019
     * the method generates the solutions overview model
     */
    generateOverviewLabel() {
        var id = generateId();
        var u = this.container.getUsedVolume();
        var t = this.container.getTotalVolume();
        if (this.id == runtimeManager.solutionFlag) {
            var html = "<div class='overview-label active' id='" + id + "'><i class='material-icons overview-label-icon solution-checker' data-solution='" + this.id + "'>check_box</i>";
        } else {
            var html = "<div class='overview-label' id='" + id + "'><i class='material-icons overview-label-icon solution-checker' data-solution='" + this.id + "'>check_box_outline_blank</i>";
        }
        html += "<span class='headline'>" + this.algorithm + "</span><div class='data' style='display: grid;'><div style='grid-row: 1; grid-column: 1;'>Berechnete Containerlänge</div><div style='grid-row: 1; grid-column: 2;'>" + parseFloat(this.container.length / 1000).toFixed(2) + "m</div><div style='grid-row: 2; grid-column: 1;'>Berechnete Auslastung</div><div style='grid-row: 2; grid-column: 2;'>" + parseInt((u / t) * 100) + "%</div></div></div>";
        return {
            html: html,
            id: id
        };
    }
    /**
     * the method returns all information about the sequence steop with the given id
     */
    getStepsForSequenceNumber(number) {
        if (this.steps != null) {
            return this.steps.find(x => x._SequenceNumber == number);
        }
        return null;
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
     * the method returns the number of sequence steps in the current solution
     */
    get sequence() {
        return Math.max(...this.container.goods.map(x => x.seqNr));
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
            _Groups: groups,
            _Steps: this.steps
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
                        "rgba(170, 255, 51, .6)",
                        "rgba(150, 150, 150, .6)"
                    ],
                    borderColor: [
                        "rgb(126, 205, 16)",
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
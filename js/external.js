var generatedIDs = [];
/**
 * Die Methode generiert zufällige, 12-stellige IDs für Objekte und DOM Elemente.
 */
function generateId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 12; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    if (generatedIDs.includes(text)) {
        generateId();
    } else {
        generatedIDs.push(text);
        return text;
    }
}
/**
 * updated 26.02.2019
 * the method generates a sortable table
 */
class SortableTable {
    /**
     * updated 26.02.2019
     * the contstrcutor generates a new instance of a table
     */
    constructor(object, widget) {
        this.widget = widget;
        this.id = generateId();
        this.customClass = "";
        this.headline = [];
        this.defaultRow = null;
        this.hasOptionColumnFirst = false;
        this.heighestIndex = 0;
        if (object != null) {
            if (object.customClass != null && typeof (object.customClass) != "undefined") {
                this.customClass = object.customClass;
            }
            if (object.headline != null && typeof (object.headline) != "undefined") {
                this.headline = object.headline;
            }
            if (object.defaultRow != null && typeof (object.defaultRow) != "undefined") {
                this.defaultRow = object.defaultRow;
            }
            if (object.hasOptionColumnFirst != null && typeof (object.hasOptionColumnFirst) != "undefined") {
                this.hasOptionColumnFirst = object.hasOptionColumnFirst;
            }
        }
        this.objects = [];
    }
    /**
     * updated 26.02.2019
     * the method adds the event listeners to the DOM
     */
    addListener() {
        var instance = this;
        for (var index in this.headline) {
            var o = this.headline[index];
            if (o.sortable) {
                if (!$("#" + instance.id + " .sortable-thead[data-attr='" + o.name + "']").hasClass("click-event-added")) {
                    $("#" + instance.id + " .sortable-thead[data-attr='" + o.name + "']").addClass("click-event-added");
                    $("#" + instance.id + " .sortable-thead[data-attr='" + o.name + "']").click(function () {
                        var attr = $(this).data("attr");
                        var technique = null;
                        instance.resetOrder(attr);
                        if ($(this).hasClass("sortable-thead-asc")) {
                            $(this).removeClass("sortable-thead-asc");
                            $(this).addClass("sortable-thead-dsc");
                            $(this).removeClass("sortable-thead-neutral");
                            $(this).find(".sort-icon").text("arrow_drop_up");
                            technique = "d";
                        } else {
                            $(this).addClass("sortable-thead-asc");
                            $(this).removeClass("sortable-thead-dsc");
                            $(this).removeClass("sortable-thead-neutral");
                            $(this).find(".sort-icon").text("arrow_drop_down");
                            technique = "a";
                        }
                        instance.sort($(this).index(), technique);
                    });
                }
            }
        }
        if (instance.defaultRow != null) {
            if (!$("#" + instance.id + " .default-row").hasClass("click-event-added")) {
                $("#" + instance.id + " .default-row").addClass("click-event-added");
                $("#" + instance.id + " .default-row").click(function () {
                    instance.defaultRow.callbackFunction(instance.defaultRow.callback);
                });
            }
        }
    }
    /**
     * updated 19.03.2019
     * the method prepends an object to the table
     */
    append(object) {
        if (Array.isArray(object)) {
            for (var index in object) {
                this.heighestIndex++;
                var c = object[index].generateListView(this.headline, this.heighestIndex);
                $("#" + this.id + " tbody").append(c.html);
                object.addExplorerListener(this.widget, c.id);
            }
        } else {
            this.heighestIndex++;
            var c = object.generateListView(this.headline, this.heighestIndex);
            $("#" + this.id + " tbody").append(c.html);
            object.addExplorerListener(this.widget, c.id);
        }
    }
    /**
     * updated 26.02.2019
     * the method clears the table
     */
    empty() {
        $("#" + this.id + " tbody").empty();
    }
    /**
     * updated 26.02.2019
     * the method fills the tbody
     */
    fillContent(content, method, eventListenerMethod, methodParam) {
        this.objects = content;
        this.empty();
        if (method == null || typeof (method) == "undefined") {
            for (var index in content) {
                this.heighestIndex = index;
                var c = content[index].generateListView(this.headline, index);
                $("#" + this.id + " tbody").append(c.html);
                content[index].addExplorerListener(this.widget, c.id);
            }
        } else {
            for (var index in content) {
                var c = content[index][method](methodParam);
                $("#" + this.id + " tbody").append(c.html);
                if (eventListenerMethod != null && typeof (eventListenerMethod) != "undefined") {
                    var u = IssueUserConnection.storage.getById(c.u);
                    u[eventListenerMethod](c.id);
                }
            }
        }
    }
    /**
     * updated 01.03.2019
     * the method filters all objects according to the search term
     * @param {*} term 
     */
    filter(term) {
        for (var index in this.objects) {
            if (this.objects[index].matches(term)) {
                $("#" + this.id + " [data-id='" + this.objects[index].id + "']").show();
            } else {
                $("#" + this.id + " [data-id='" + this.objects[index].id + "']").hide();
            }
        }
    }
    /**
     * updated 26.02.2019
     * the method generates the html code
     */
    generate() {
        var html = "<table id='" + this.id + "' class='sortable-table " + this.customClass + "'>";
        if (this.headline.length > 0) {
            html += "<thead><tr class='headline'>";
            if (this.hasOptionColumnFirst == true) {
                html += "<th></th>";
            }
            for (var index in this.headline) {
                var o = this.headline[index];
                html += "<th ";
                if (o.minWidth != null && typeof (o.minWidth) != "undefined") {
                    html += "style='min-width: " + o.minWidth + "px;' ";
                }
                if (o.sortable) {
                    html += "class='sortable-thead sortable-thead-neutral' data-attr='" + o.name + "'>" + o.name + "<i class='material-icons sort-icon'>swap_vert</i>";
                } else {
                    html += "class='no-sortable-thead'>" + o.name;
                }
                html += "</th>";
            }
            html += "</tr>";
            if (this.defaultRow != null) {
                var c = this.headline.length - 1;
                html += "<tr class='default-row'><th class='icon'>";
                if (this.defaultRow.icon != null) {
                    html += "<i class='material-icons'>" + this.defaultRow.icon + "</i>";
                }
                html += "</th><th colspan=" + c + ">" + this.defaultRow.text + "</th></tr>";
            }
            html += "</thead>";
        }
        html += "<tbody></tbody></table>";
        return html;
    }
    /**
     * updated 19.03.2019
     * the method returns a table row by the containing object id
     */
    getRowById(id) {
        return $("#" + this.id + " tr[data-id='" + id + "']");
    }
    /**
     * updated 27.02.2019
     * the method hides the table
     */
    hide() {
        $("#" + this.id).hide();
    }
    /**
     * updated 19.03.2019
     * the method prepends an object to the table
     */
    prepend(object) {
        if (Array.isArray(object)) {
            for (var index in object) {
                this.heighestIndex++;
                var c = object[index].generateListView(this.headline, this.heighestIndex);
                $("#" + this.id + " tbody").prepend(c.html);
                object.addExplorerListener(this.widget, c.id);
            }
        } else {
            this.heighestIndex++;
            var c = object.generateListView(this.headline, this.heighestIndex);
            $("#" + this.id + " tbody").prepend(c.html);
            object.addExplorerListener(this.widget, c.id);
        }
    }
    /**
     * 28.02.2019
     * the method resets all orders
     */
    resetOrder(leave) {
        $("#" + this.id + " .sortable-thead:not([data-attr='" + leave + "'])").each(function () {
            $(this).removeClass("sortable-thead-asc");
            $(this).removeClass("sortable-thead-dsc");
            $(this).addClass("sortable-thead-neutral");
            $(this).find(".sort-icon").text("swap_vert");
        });
    }
    /**
     * updated 27.02.2019
     * the method shows the table
     */
    show() {
        $("#" + this.id).show();
    }
    /**
     * updated 28.02.2019
     * the method sorts the table by the given column and the given technique
     */
    sort(column, technique) {
        var set = [];
        column++;
        $("#" + this.id + " tbody tr td:nth-child(" + column + ")").each(function (index) {
            set.push({ p: index, v: $(this).data("value"), e: $(this).parent() });
        });
        switch (technique) {
            case "d":
                set = set.sort(function (a, b) {
                    if ($.isNumeric(a.v)) {
                        var x = a.v;
                    } else {
                        var x = a.v.toLowerCase();
                    }
                    if ($.isNumeric(b.v)) {
                        var y = b.v;
                    } else {
                        var y = b.v.toLowerCase();
                    }
                    return ((x > y) ? 1 : ((x < y) ? -1 : 0));
                });
                break;
            default:
                set = set.sort(function (a, b) {
                    if ($.isNumeric(a.v)) {
                        var x = a.v;
                    } else {
                        var x = a.v.toLowerCase();
                    }
                    if ($.isNumeric(b.v)) {
                        var y = b.v;
                    } else {
                        var y = b.v.toLowerCase();
                    }
                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                });
                break;
        }
        for (var index in set) {
            $(set[index].e).hide();
            $(set[index].e).appendTo("#" + this.id + " tbody");
            $(set[index].e).fadeIn();
        }
    }
}
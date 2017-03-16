//HEAD 
(function(app) {
try { app = angular.module("repotable"); }
catch(err) { app = angular.module("repotable", []); }
app.run(["$templateCache", function($templateCache) {
"use strict";

$templateCache.put("repotable/partials/filters","<div>\n" +
    "    <span class=\"float-right\" ng-click=\"table.resetFilters()\" ng-bind=\"table.locale.reset\"></span>\n" +
    "    <!-- OPTIONS -->\n" +
    "    <div class=\"option\" ng-repeat=\"option in table.options track by $index\" ng-class=\"{ active: !option.closed }\">\n" +
    "        <h6 ng-click=\"option.closed = !option.closed\"><i ng-class=\"option.icon\"></i> <span ng-bind=\"option.name\"></span></h6>\n" +
    "        <!-- GROUP -->\n" +
    "        <div class=\"group\" ng-repeat=\"group in option.groups track by $index\" ng-if=\"group.items.length && !option.closed\">\n" +
    "            <h4 ng-bind=\"group.name\"></h4>\n" +
    "            <ul class=\"fields\">\n" +
    "                <!-- ITEMS -->\n" +
    "                <li class=\"field\" ng-class=\"{ 'active': table.active(item) }\" ng-repeat=\"item in group.items track by $index\" ng-click=\"group.toggle ? group.toggle(item) : option.toggle(item)\">\n" +
    "                    <span ng-bind=\"item.name\"></span> <i class=\"icon-check-mark\"></i>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>")

$templateCache.put("repotable/partials/repotable","<div class=\"repotable\">\n" +
    "    <div style=\"display: flex;\">\n" +
    "        <section class=\"container-fluid shadow section-bordered margin-bottom-xs-40\">\n" +
    "            <h6 class=\"headline foreground light-60\">\n" +
    "                <i ng-class=\"{ 'icon-search': !table.search, 'icon-close': table.search }\" ng-click=\"table.search = null\"></i>\n" +
    "                <input type=\"text\" class=\"form-control\" placeholder=\"{{table.name}}\" ng-model=\"table.search\" ng-model-options=\"{ allowInvalid: true, debounce: 250 }\">\n" +
    "                <i class=\"icon-settings float-right\" ng-click=\"tabs.opened = !tabs.opened\"></i>\n" +
    "            </h6>\n" +
    "            <div class=\"inner\" ng-if=\"table.has('table')\">\n" +
    "                <div ng-include=\"'repotable/partials/table'\"></div>\n" +
    "            </div>\n" +
    "            <!-- FILTERS -->\n" +
    "            <div class=\"filters\" ng-class=\"{ opened: tabs.opened }\" ng-include=\"'repotable/partials/filters'\" ng-if=\"tabs.opened\"></div>\n" +
    "            <!-- ERRORS -->\n" +
    "            <div ng-include=\"'partials/errors'\"></div>\n" +
    "            <!-- EXCEL -->\n" +
    "            <div class=\"row\" ng-if=\"filtered.length\">\n" +
    "                <div class=\"col-lg-12 text-xs-right\">\n" +
    "                    <button type=\"button\" ng-click=\"excel()\" class=\"btn btn-sm btn-outline-primary btn-icon btn-block-md-down\">Esporta in Excel <i class=\"icon-print\"></i></button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </section>\n" +
    "    </div>\n" +
    "</div>")

$templateCache.put("repotable/partials/table","<div>\n" +
    "    <table class=\"atable-responsive atable-responsive-default atable-dynamic\" style=\"table-layout: auto; width: 100%;\">\n" +
    "        <!-- HEAD -->\n" +
    "        <thead>\n" +
    "            <tr>\n" +
    "                <th class=\"{{col.headerClass}}\" ng-repeat=\"col in table.cols track by $index\" ng-model=\"col\" droppable-item=\".draggable\" droppable-index=\"$index\" draggable-item=\".draggable\" draggable-if=\"col.groupBy\" droppable-if=\"col.groupBy\" ng-disabled=\"!col.groupBy\">\n" +
    "                    <div class=\"draggable\">\n" +
    "                        <span class=\"th-label\" title=\"{{col.colName}}\" ng-bind=\"col.colName\"></span>\n" +
    "                        <div ng-if=\"col.filters.values.length > 1\">\n" +
    "                            <button class=\"filter-btn dropdown-toggle\" toggler=\"table.dropdown\" value=\"col.$id\" target=\"#nav-col-{{col.$id}}\">\n" +
    "                                <span ng-bind=\"table.locale.filter\"></span>\n" +
    "                            </button>\n" +
    "                        </div>\n" +
    "                        <button class=\"sort-btn\" ng-click=\"table.toggleOrder(col)\" ng-title=\"col.order.name\">\n" +
    "                            <span><span ng-bind=\"col.order.name\"></span> <i ng-class=\"{ 'icon-sort-asc' : col.order.asc, 'icon-sort-desc' : col.order.desc }\"></i></span>\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "                </th>\n" +
    "            </tr>\n" +
    "        </thead>\n" +
    "        <!-- ROWS -->\n" +
    "        <tbody ng-repeat=\"row in table.rows | filter:table.doFilterStatic(table.cols) | orderBy:table.filteredOrderBy | limitTo:(tabs.opened ? 3 : null) as filteredRows track by $index\" ng-if=\"!source.state.isBusy && table.rows.length\">\n" +
    "            <tr>\n" +
    "                <td ng-repeat=\"cell in row.cols track by $index\" style=\"position: relative;\" link-to=\"cell.link\" class=\"{{cell.cellClass}} {{cell.columnClass}}\">\n" +
    "                    <label ng-bind=\"cell.colName\"></label>\n" +
    "                    <span class=\"{{cell.textClass}}\" ng-class=\"{ 'text-underline': cell.pop, 'text-highlight': cell.matches.length }\" ng-bind=\"cell.getName()\" pop=\"cell.pop\"></span>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </tbody>\n" +
    "        <!-- FOOT -->\n" +
    "        <tfoot ng-if=\"!source.state.isBusy && filteredRows.length\">\n" +
    "            <tr class=\"row-recap\">\n" +
    "                <td class=\"{{col.headerClass}}\" ng-repeat=\"col in table.cols track by $index\">\n" +
    "                    <label ng-if=\"col.aggregate || col.compare\" ng-bind=\"col.colName\"></label>\n" +
    "                    <span ng-if=\"col.aggregate || col.compare\" class=\"tag {{col.textClass}} {{col.totalClass}}\" ng-bind=\"col.getTotalName(filteredRows)\"></span>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </tfoot>\n" +
    "        <!-- NO RESULTS -->\n" +
    "        <tbody ng-if=\"!source.state.isBusy && !filteredRows.length\">\n" +
    "            <tr>\n" +
    "                <td class=\"text-xs-center\" colspan=\"{{table.fields.getCount()}}\">\n" +
    "                    <p>\n" +
    "                        <span ng-bind=\"table.locale.no_results\"></span>\n" +
    "                    </p>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "    <ul ng-repeat=\"col in table.cols track by $index\" ng-if=\"table.dropdown == col.$id\" class=\"fields fields-filters\" id=\"nav-col-{{col.$id}}\">\n" +
    "        <li ng-repeat=\"value in col.filters.values\" class=\"field\" ng-class=\"{ active: value.active }\" ng-click=\"stop($event) && col.filters.toggle(value)\">\n" +
    "            <span ng-bind=\"value.name\"></span> <i class=\"icon-check-mark\"></i>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>")
}]);
})();
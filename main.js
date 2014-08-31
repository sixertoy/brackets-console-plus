/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, console, brackets, _, $, Mustache */
define(function (require, exports, module) {

    'use strict';
    /** ------------------------------------

    Modules

*/
    var _ = brackets.getModule('thirdparty/lodash'),
        Menus = brackets.getModule("command/Menus"),
        AppInit = brackets.getModule('utils/AppInit'),
        Resizer = brackets.getModule('utils/Resizer'),
        PanelManager = brackets.getModule('view/PanelManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        CommandManager = brackets.getModule('command/CommandManager'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');
    ExtensionUtils.loadStyleSheet(module, 'styles/styles.css');
    /** ------------------------------------

    Globals

*/
    var EXTENSION_ID = 'brackets-console',
        WINDOWS_MENU_ID = EXTENSION_ID + '.windows.menus',
        SHOWPANEL_COMMAND_ID = EXTENSION_ID + '.showpanel';
    /** ------------------------------------

    UI Templates

*/
    var Strings = require('./ln18'),
        RegexUtils = require('./lib/RegexUtils'),
        RowHTML = require('text!htmlContent/row.html'),
        PanelHTML = require('text!htmlContent/panel.html'),
        ButtonHTML = require('text!htmlContent/button.html');
    /** ------------------------------------

    Variables

*/
    var logsCount = 0,
        warnsCount = 0,
        errorsCount = 0,
        debugPrefs = PreferencesManager.getExtensionPrefs('debug'),
        extensionPrefs = PreferencesManager.getExtensionPrefs(EXTENSION_ID);
    /** ------------------------------------

    UI Variables

*/
    var $appPanel,
        $appButton,
        $logContainer;
    /** ------------------------------------

    Private Functions

*/
    /**
     *
     * MAJ des compteurs dans le panneau
     * MAJ du compteur de l'icone
     *
     */
    function _updateNotifierIcon() {
        $('#' + EXTENSION_ID + '-panel .toolbar .warn small em').first().text((warnsCount));
        $('#' + EXTENSION_ID + '-panel .toolbar .error small em').first().text((errorsCount));
        $('#' + EXTENSION_ID + '-panel .toolbar .debug small em').first().text((logsCount - (errorsCount + warnsCount)));
        var $input = $('#brackets-console-button .counts');
        $input.toggle(errorsCount > 0);
        $input.find('em').first().text(errorsCount);
    }

    /**
     *
     * Masque/Affiche le panneau
     * MAJ de la class de l'icone du panneau
     *
     */
    function _handlerPanelVisibility() {
        $appButton.toggleClass('active');
        Resizer.toggle($appPanel);
        CommandManager.get(SHOWPANEL_COMMAND_ID).setChecked($appButton.hasClass('active'));
        if (!$appButton.hasClass('active')) {
            EditorManager.focusEditor();
        }
    }

    function _refreshPanel(event) {
        var $this = $(event.currentTarget);

        $logContainer.find('.box > *').show();

        var child = $this.parent().find('.active').first();
        if (child !== null) {
            child.removeClass('active');
        }
        if (child.data('name') !== $this.data('name')) {
            $logContainer.find('.box > *').hide();
            $this.addClass('active');
            $logContainer.find('.box > .' + $this.data('name')).show();
        }
    }

    function __getErrorObject(stacks) {
        // format orginal stacks
        var oTraces = _.filter(stacks.split("\n"), function (v) {
            return $.trim(v);
        });
        var traces = oTraces.slice(1);

        var file = traces[1].match(RegexUtils.file());
        file = file !== null ? file.length ? file[0] : '' : '';
        var shortFile = file !== '' ? file.split('/')[file.split('/').length - 1] : '';

        var lineAndColumn = traces[1].match(RegexUtils.lineAndColumn());
        var line = lineAndColumn !== null ? lineAndColumn.length ? lineAndColumn[0] : '' : '';
        var column = lineAndColumn !== null ? lineAndColumn.length ? lineAndColumn[1] : '' : '';

        return {
            fileName: file,
            lineNumber: line,
            errorStacks: traces,
            columnNumber: column,
            shortFileName: shortFile
        };
    }
    /** ------------------------------------

    Console Functions

*/
    function clearConsole() {
        $logContainer.find('.box').html('');
        logsCount = 0;
        warnsCount = 0;
        errorsCount = 0;
        _updateNotifierIcon();
    }

    function log(msg, err, type) {
        if ($logContainer !== null) {
            logsCount++;
            if (_.isObject(msg)) {
                msg = JSON.stringify(msg);
            }
            if (_.isUndefined(msg)) {
                msg = 'undefined';
            }
            var q,
                ln18 = _.extend(err, {
                    message: msg,
                    even: (logsCount % 2) ? 'odd' : '',
                    type: type
                }),
                $row = $(Mustache.render(RowHTML, ln18));
            $logContainer.find('.box').first().append($row);
            $row.on('click', function () {
                q = $(this).find('quote');
                if ($(q).is(':visible')) {
                    $(q).hide();
                } else {
                    $(q).show().css('display', 'block'); // Display block fix;
                }
            });
            $row.find('quote').first().hide();
            _updateNotifierIcon();
        }
    }

    function warn(msg, err) {
        if ($logContainer !== null) {
            warnsCount++;
            log(msg, err, 'warn');
        }
    }

    function error(msg, err) {
        if ($logContainer !== null) {
            errorsCount++;
            log(msg, err, 'error');
        }
    }
    /** ------------------------------------

    Extension Inits

*/
    /**
     *
     * HTML ready
     * Load StyleSheet
     * Create Panel
     * Create Button
     * Get count notifier
     * Get logs container
     * Get close button
     * Add listeners toggle panel visible/hide
     *
     */
    AppInit.htmlReady(function () {

        var minHeight = 100;
        PanelManager.createBottomPanel(EXTENSION_ID + '.panel', $(Mustache.render(PanelHTML, Strings)), minHeight);
        $appPanel = $('#' + EXTENSION_ID + '-panel');
        $logContainer = $('#' + EXTENSION_ID + '-panel .table-container');

        var base = '#' + EXTENSION_ID + '-panel .toolbar';
        $(base + ' .clear').on('click', clearConsole);

        $(base + ' .close').on('click', _handlerPanelVisibility);
        $(base + ' .title').on('click', _handlerPanelVisibility);

        $(base + ' .error').on('click', _refreshPanel);
        $(base + ' .debug').on('click', _refreshPanel);
        $(base + ' .warn').on('click', _refreshPanel);

        $('#main-toolbar .buttons').append(Mustache.render(ButtonHTML, Strings));
        $appButton = $('#' + EXTENSION_ID + '-button').on('click', _handlerPanelVisibility);
        $($appButton).find('.counts').first().hide();

        _updateNotifierIcon();


    });

    AppInit.appReady(function () {});
    /** ------------------------------------

    Commands and Menus

*/
    function __registerCommands() {
        CommandManager.register("Show Console", SHOWPANEL_COMMAND_ID, _handlerPanelVisibility);
    }
    __registerCommands();


    function __registerWindowsMenu() {
        var menu = Menus.addMenu('Windows', WINDOWS_MENU_ID, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
        menu.addMenuItem(SHOWPANEL_COMMAND_ID);
    }
    __registerWindowsMenu();
    /** ------------------------------------

    Console Proto

*/
    function __initConsoleWrapper() {
        var _log = console.log,
            _warn = console.warn,
            _debug = console.debug,
            _error = console.error;

        console.log = function () {
            var obj = __getErrorObject((new Error('')).stack),
                msg = _.toArray(arguments)[0];
            log(msg, obj, 'debug');
            return _log.apply(console, arguments);
        };

        console.error = function () {
            var obj = __getErrorObject((new Error('')).stack),
                msg = _.toArray(arguments)[0];
            error(msg, obj);
            return _error.apply(console, arguments);
        };

        console.warn = function () {
            var obj = __getErrorObject((new Error('')).stack),
                msg = _.toArray(arguments)[0];
            warn(msg, obj);
            return _warn.apply(console, arguments);
        };

        // Exports
        exports.log = log;
        exports.debug = log;
        exports.warn = warn;
        exports.error = error;
        exports.clear = clearConsole;
    }
    __initConsoleWrapper();

});

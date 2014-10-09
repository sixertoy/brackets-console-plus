/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, console, brackets, _, $, Mustache, window, document */
define(function (require, exports, module) {

    'use strict';
    /** ------------------------------------

    Modules

*/
    var _ = brackets.getModule('thirdparty/lodash'),
        GotoAgent = brackets.getModule('LiveDevelopment/Agents/GotoAgent'),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        Resizer = brackets.getModule('utils/Resizer'),
        Commands = brackets.getModule('command/Commands'),
        PanelManager = brackets.getModule('view/PanelManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        MainViewManager = brackets.getModule('view/MainViewManager'),
        CommandManager = brackets.getModule('command/CommandManager'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');
    ExtensionUtils.loadStyleSheet(module, 'styles/styles.css');
    /** ------------------------------------

    Globals

*/
    var PREFIX = 'malas34',
        EXTENSION_ID = 'brackets-consoleplus',
        SHOWPANEL_COMMAND_ID = PREFIX + '.' + EXTENSION_ID + '.showpanel';
    /** ------------------------------------

    UI Templates

*/
    var ExtensionStrings = require('strings'),
        RegexUtils = require('lib/regex-utils'),
        CircularJSON = require('lib/circular-json'),
        RowHTML = require('text!htmlContent/row.html'),
        PanelHTML = require('text!htmlContent/panel.html'),
        ButtonHTML = require('text!htmlContent/button.html');
    /** ------------------------------------

    Variables

*/
    var $exceptions = [],
        logsCount = 0,
        warnsCount = 0,
        errorsCount = 0,
        debugPrefs = PreferencesManager.getExtensionPrefs('debug'),
        extensionPrefs = PreferencesManager.getExtensionPrefs(PREFIX + '.' + EXTENSION_ID);
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
        $('#brackets-console-panel .toolbar .warn small em').first().text((warnsCount));
        $('#brackets-console-panel .toolbar .error small em').first().text((errorsCount));
        $('#brackets-console-panel .toolbar .debug small em').first().text((logsCount - (errorsCount + warnsCount)));
        var $input = $appButton.find('.counts').first();
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
        Resizer.toggle($appPanel);
        $appButton.toggleClass('active');
        CommandManager.get(SHOWPANEL_COMMAND_ID).setChecked($appButton.hasClass('active'));
        if (!$appButton.hasClass('active')) {
            MainViewManager.focusActivePane();
        }
    }

    function _refreshPanel(event) {
        var $this = $(event.currentTarget);
        $logContainer.find('.box > *').show();
        var child = $this.parent().find('.active').first();
        if (!_.isNull(child) && !_.isUndefined(child)) {
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
        var line = lineAndColumn !== null ? lineAndColumn.length ? lineAndColumn[0].substr(1) : '0' : '0';
        var column = lineAndColumn !== null ? lineAndColumn.length ? lineAndColumn[1].substr(1) : '0' : '0';

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

    function _logObject(obj) {
        var msg = '';
        try {
            msg = JSON.stringify(obj);
            return msg;

        } catch (e) {
            msg = '[Object object] Circular JSON';
            return msg;

        }
    }

    function _logArray(arr) {
        var i = 0, msg = '';
        for (i = 0; i < arr.length; i++) {
            if (_.isString(arr[i]) || _.isNumber(arr[i]) || _.isNull(arr[i]) || _.isUndefined(arr[i])) {
                msg += arr[i];

            } else if (_.isArray(arr[i])) {
                msg += _logArray(arr[i]);

            } else if (_.isPlainObject(arr[i])) {
                msg += _logObject(arr[i]);

            }
            msg +=  '\r\n';
        }
        return msg;
    }

    function log(msg, err, type) {
        if ($logContainer !== null) {
            logsCount++;

            if (!_.isString(type)) {
                type = 'debug';

            }

            if (_.isArray(msg)) {
                msg = _logArray(msg);

            } else if (_.isPlainObject(msg)) {
                msg = _logObject(msg);

            } else if (_.isUndefined(msg)) {
                msg = 'undefined';

            } else if (_.isNull(msg)) {
                msg = 'null';

            }

            var q,
                str = _.extend(err, {
                    type: type,
                    message: msg,
                    even: (logsCount % 2) ? 'odd' : ''
                }),
                $row = $(Mustache.render(RowHTML, str));
            $logContainer.find('.box').first().append($row);
            $row.find('a').first().on('click', function () {
                var l = parseFloat($(this).data('location'));
                GotoAgent.open($(this).data('url'), 0);
            });
            $row.find('.message').first().on('click', function () {
                q = $(this).parent().find('quote');
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
        PanelManager.createBottomPanel(EXTENSION_ID + '.panel', $(Mustache.render(PanelHTML, ExtensionStrings)), minHeight);
        // WorkspaceManager.createBottomPanel
        $appPanel = $('#brackets-console-panel');
        $logContainer = $($appPanel.find('.table-container').first());

        var base = '#brackets-console-panel .toolbar';
        $(base + ' .clear').on('click', clearConsole);
        $(base + ' .warn').on('click', _refreshPanel);
        $(base + ' .error').on('click', _refreshPanel);
        $(base + ' .debug').on('click', _refreshPanel);
        $(base + ' .close').on('click', _handlerPanelVisibility);
        $(base + ' .title').on('click', _handlerPanelVisibility);

        $('#main-toolbar .buttons').append(Mustache.render(ButtonHTML, ExtensionStrings));
        $appButton = $('#brackets-console-button').on('click', _handlerPanelVisibility);
        $($appButton).find('.counts').first().hide();

        _updateNotifierIcon();

    });

    /** ------------------------------------

    Commands and Menus

*/
    function __registerCommands() {
        CommandManager.register(ExtensionStrings.SHOW_PANEL, SHOWPANEL_COMMAND_ID, _handlerPanelVisibility);
    }


    function __registerWindowsMenu() {
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(SHOWPANEL_COMMAND_ID, 'CTRL-F12', Menus.AFTER, Commands.VIEW_TOGGLE_INSPECTION);
    }

    AppInit.appReady(function () {

        __registerCommands();
        __registerWindowsMenu();

    });
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
            log(msg, obj);
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
    /** ------------------------------------

    Window Error & Exceptions

*/
    /*
    var _windowConsoleError = $(window).console.error;
    function __initWindowConsoleErrorWrapper() {
        $(window).console.error = function(){
            return _windowConsoleError.apply(window.console, arguments);
        }
    }
    __initWindowConsoleErrorWrapper();
    */
    /*
        window.console.error = function(){
            var oEvent = {};
                oEvent.fileName = 'ttotototo.text';
            var obj = {
                errorStacks: [],
                lineNumber: 0, // oEvent.lineno,
                fileName: oEvent.filename,
                columnNumber: 0, // oEvent.colno,
                shortFileName: oEvent.filename !== '' ? oEvent.filename.split('/')[oEvent.filename.split('/').length - 1] : ''
            };
            $exceptions.push('yo');
            error(oEvent.fileName, obj);
            return _windowConsoleError.apply(window.console, arguments);
        };
    */

    function __initWindowErrorWrapper() {
        $(window).on('error', function (event) {
            var oEvent = event.originalEvent;
            var obj = {
                errorStacks: [],
                lineNumber: oEvent.lineno,
                fileName: oEvent.filename,
                columnNumber: oEvent.colno,
                shortFileName: oEvent.filename !== '' ? oEvent.filename.split('/')[oEvent.filename.split('/').length - 1] : ''
            };
            error(oEvent.message, obj);
        });

    }
    __initWindowErrorWrapper();

});

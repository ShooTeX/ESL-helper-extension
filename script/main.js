// ==UserScript==
// @name         ESL Admin Helper
// @namespace    https://play.eslgaming.com/rainbowsix/europe-pc/
// @version      1.3.5
// @description  ESL Rainbow Six Siege Admin Helper
// @author       Deadshot & ShooTeX
// @updateURL    https://gist.githubusercontent.com/ShooTeX/753c349c0adc0a222f44b963da3f1494/raw
// @downloadURL  https://gist.githubusercontent.com/ShooTeX/753c349c0adc0a222f44b963da3f1494/raw
// @require      https://greasyfork.org/scripts/622-super-gm-setvalue-and-gm-getvalue-js/code/Super_GM_setValue_and_GM_getValuejs.js?version=1786
// @match        https://play.eslgaming.com/*
// @grant        GM_notification
// @grant        window.focus
// @grant        GM_SuperValue
// @grant        GM_setValue
// @grant        GM_getValue
// @copyright  	 Steven "Deadshot" Klar
// ==/UserScript==
/*
+++ Featues +++
- Show ticket counter with and without admin assignment
- Notification when there are tickets without admin assignment
- Configure features
- Change NavNode
- Admin Match Link in protest
- Easy "Go back to Match"-link in Admin Match page
- Add generic protest link to admin menu in Matches
- Admin quick list in support tickets for easy move
- Fast forward to oldest unassigned ticket
- Show Match chatlog/logfile in Match instead of page reload
- Quick Protest timer, never forget a cup protest again
*/

(function() {
    'use strict';

    class Page{

        static isAdminMatch(){
            return window.location.href.indexOf("/admin_match/") > -1;
        }

        static isBracket(){
            return (window.location.href.indexOf("/rankings/") > -1 && $(".league--header .description").text().indexOf("Cup") > -1);
        }

        static isLeagueResults(){
            return (window.location.href.indexOf("/results/") > -1 && $(".league--header .description").text().indexOf("League") > -1);
        }

    }

    class LeagueResults{

        static fixTables(){
            $("table.esl_compact_zebra tr[onclick]").removeAttr("style").removeAttr("onclick");

            $("table.esl_compact_zebra").attr("width", "100%");

            var cells = $("table.esl_compact_zebra tr td").filter(function(index){
                return index % 6 === 3;
            });

            cells.toArray().forEach(function(entry){
                var elem = '<a href="' + $(entry.firstChild).attr("href").replace("match", "admin_match") + '" target="_blank">Admin</a>';
                var td = "<td class='TextS' align='center' width='4%'>" + elem + "</td>";
                $(td).insertAfter(entry);
            });

            $("table.esl_compact_zebra tr th").attr("colspan", 7);

        }

    }

    class AdminMatch{

        static checkMatch(){
            var statusOptions = $("select[name=status] option").toArray();
            statusOptions.forEach(function(entry){
                if($(entry).text().indexOf("closed") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=status]").val("closed");

            var calcOptions = $("select[name=calculate] option").toArray();
            calcOptions.forEach(function(entry){
                if($(entry).text().indexOf("yes") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=calculate]").val("yes");

            $("input[type=checkbox]").not("[name='featured']").attr("checked", "checked");
        }

        static openMatch(){
            var statusOptions = $("select[name=status] option").toArray();
            statusOptions.forEach(function(entry){
                if($(entry).text().indexOf("open") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=status]").val("open");

            $("td:contains('round1team2')").siblings().not(".TextS").children().not("[type=hidden]").val("");
            $("td:contains('round1team2')").siblings().not(".TextS").children().not("[type=hidden]").val("");

            $("input[type=checkbox]").removeAttr("checked");
        }

        static deleteMatch(){
            var delOptions = $("select[name=active] option").toArray();
            delOptions.forEach(function(entry){
                if($(entry).text().indexOf("no") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=active]").val("no");
            $("select[name=active]").parents().filter("form").submit();
        }

        static activateMatch(){
            var delOptions = $("select[name=active] option").toArray();
            delOptions.forEach(function(entry){
                if($(entry).text().indexOf("yes") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=active]").val("yes");
            $("select[name=active]").parents().filter("form").submit();
        }

        //contestant={1,2}
        static setwin(contestant, isDefwin){
            if(isDefwin){
                var statusOptions = $("select[name=defaultwin] option").toArray();
                statusOptions.forEach(function(entry){
                    if(parseInt($(entry).val()) != contestant)
                        $(entry).attr("selected", "");
                    else
                        $(entry).removeAttr("selected");
                });

                $("select[name=defaultwin]").val(contestant);
            }

            var score1, score2;
            if(contestant === 1){
                score1 = 1;
                score2 = 0;
            }else{
                score1 = 0;
                score2 = 1;
            }
            $("td:contains('round1team1')").siblings().not(".TextS").children().not("[type=hidden]").val(score1);
            $("td:contains('round1team2')").siblings().not(".TextS").children().not("[type=hidden]").val(score2);
        }

        static generateButton(name, text, type, onClick, href = true){
            var a = $("<a>" + text + "</a>");
            a.addClass("btn");
            a.addClass("btn-" + type);
            a.addClass("helper-" + name);
            if(href)
                a.attr("href", "#checked");
            a.click(onClick);
            return a;
        }

        static generateOpenMatchButton(){
            return AdminMatch.generateButton("open", "Reopen match", "success", AdminMatch.openMatch);
        }

        //contestant={1,2}
        static generateWinButton(contestant, isDefwin){
            var name = $("input[type=hidden]").filter("[name='contestant[" + contestant + "][name]']").val();

            var text;
            if(isDefwin)
                text = "Defwin to ";
            else
                text = "Win to ";
            return AdminMatch.generateButton("defwin", text + name, "primary", function(){
                AdminMatch.setwin(contestant, isDefwin);
                AdminMatch.checkMatch();
            });
        }

        static generateCheckButton(){
            return AdminMatch.generateButton("check", "Check match", "primary", AdminMatch.checkMatch);
        }

        static generateDelButton(){
            return AdminMatch.generateButton("delete", "Delete match", "danger", AdminMatch.deleteMatch, false);
        }

        static generateActiveButton(){
            return AdminMatch.generateButton("active", "Reactivate match", "success", AdminMatch.activateMatch, false);
        }

        static setButtons(){
            var buttons = [];

            $("<a id='checked'></a>").insertBefore($($(".TitleS")[2]));

            var player1 = parseInt($("input[name='contestant[1]'").attr("value"));
            var player2 = parseInt($("input[name='contestant[2]'").attr("value"));

            if($("select[name=active]").val().indexOf("yes") !== -1){
                if($("select[name=status]").val().indexOf("closed") !== -1){
                    var openMatch = AdminMatch.generateOpenMatchButton();
                    buttons.push(openMatch);
                }else{
                    var checkMatch = AdminMatch.generateCheckButton();
                    buttons.push(checkMatch);
                    if(player1 > 0){
                        if(player2 === 0){
                            var defwin1 = AdminMatch.generateWinButton(1, true);
                            buttons.push(defwin1);
                        }else{
                            var win1 = AdminMatch.generateWinButton(1, false);
                            var win2 = AdminMatch.generateWinButton(2, false);
                            buttons.push(win1);
                            buttons.push(win2);
                        }
                    }
                    if(player2 > 0){
                        if(player1 === 0){
                            var defwin2 = AdminMatch.generateWinButton(2, true);
                            buttons.push(defwin2);
                        }
                    }
                }
                var delMatch = AdminMatch.generateDelButton();
                buttons.push(delMatch);
            }else{
                var activateMatch = AdminMatch.generateActiveButton();
                buttons.push(activateMatch);
            }

            for(var i = 0; i < buttons.length; i++){
                if(i === 0){
                    $(buttons[i]).insertBefore($("form")[0]);
                    continue;
                }
                $(buttons[i]).insertAfter($(buttons[i-1]));
            }
        }

    }

    class Brackets{

        static updateVSButtons(){
            var vsDiv = $(".inner-status");
            vsDiv.css("left", "0");
            vsDiv.css("right", "0");
            vsDiv.css("width", "80%");
            vsDiv.css("margin", "0px auto");

            var MATCH = $(".inner-status a");
            MATCH.text("MATCH");
            MATCH.wrap("<div style='width:45%;display:inline-block;'></div>");

            $(MATCH).each(function() {
                $(this).attr("href", $(this).attr("href") + "?killcache=true");
            });

            var DIVs = $(".inner-status div");

            DIVs.toArray().forEach(function(entry){
                var clone = $(entry).clone();
                clone.children().filter("a").text("ADMIN");
                var url = clone.children().filter("a").attr("href");
                clone.children().filter("a").attr("href", url.replace("match", "admin_match"));
                clone.insertAfter(entry);
                $("<span>|</span>").insertAfter(entry);
            });
        }

    }

    if(Page.isAdminMatch()){
        AdminMatch.setButtons();
    }
    if(Page.isBracket()){
        Brackets.updateVSButtons();
    }
    if(Page.isLeagueResults()){
        LeagueResults.fixTables();
    }

})();

class App {
    static init() {
        setTimeout(function() {
            Menu.init();
        }, 1000);

        if (URL.isProtest()) {
            Protest.addAdminMatchLink();
            Protest.addSentences();

            setInterval(function() {
                $.get('', function(data) {
                    var ticketTable = $(data).find('.esl-content > div > table').eq(1);

                    $('.esl-content > div > table').eq(1).html(ticketTable.html());
                });
            }, 30000);


            //Quick answer suggestion

            /**var firstPost = $ ('.esl-content > div > table:eq(1) > tbody > tr:eq(1) > td:eq(2)').text();
            var originalText2 = $('textarea[name=body]').val();

            function quickAnswer(){
                if (firstPost.includes("admin")){
                    $('textarea[name=body]').val(function(i, v){
                   return v.replace('\n\n\n', '\n\n'+ 'asd' +'\n');
                   console.log(originalText2);
                    });
            };
            };**/

            //quickAnswer();

            //Timer prototype

            var snd = new  Audio("data:audio/ogg;base64,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o5RjEEpprUKIMeekpNRahhBjzklJqbWoMcYclJJSa1FjjEEopbUYo0qdg5BSazFGlToHIaXWYoxSmlJKSi3GGKU0pZSUYqwxSiljSq3FWGuU0taUWoux1iildDLGVmvPzTnnZIyxxpwLAEBocAAAO7BhdYSTorHAQkNWAgB5AAAMUkoxxhhjTinFGGOMMaeUUowxxphTijHGGGPMOccYY4wx5pxjjDHGGHPOMcYYY4w55xhjjDHGnHPOMcYYY8455xhjjDHnnHOMMcaYAACgAgcAgAAbRTYnGAkqNGQlABAOAAAYw5RzjkEnJZUKIcYgdE5KSi1VCDEGIYRSUmqtec45CCGUklJrzXPOSQihlJRaa66FUEopJbXWWnMthFJKSam1GJtzIoSQSkqttdiUEiGElFJrLcaklIylpNRajDEmpWxMJaXWWowxKaWUa63FGGONSSmlXGuptVhrTUop5XNsMcZaa1JKKSFki6nGnAsAMHlwAIBKsHGGlaSzwtHgQkNWAgC5AQAMQowx5pxzzjnnnHPOSaUYc845CCGEEEIIIZRKMeacc85BCCGEEEIoGXPOOQghhBBCCCGEUErpnHMQQgghhBBCCKGU0jkHIYQQQgghhBBCKaVzzkEIIYQQQgghhFJKCCGEEEIIIYQQQgillFJCCCGEEEIIIYQQSimlhBBCCCGUEEIIIZRSSgkhhBBCCCGEEEIopZQSQgghhFBKCSGEUEoppZQQQgillBBCCKGUUkopoZRQSimhhFJCKaWUUkIppZQSQimhlFJKKaWUUkopIYQSQgillFJKKaWUUkoIJZRQSimllFJKKaWUEkIJIZRSSimllFJCCCGEEkIppZRSSimllFJCCaGEUEoppZRSSiklhFJCCaEAAKADBwCAACMqLcROM648AkcUMkxAhYasBABCAgAAQyillFJKKaWUUsMYpZRSSimllFJqHKWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFIqpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKAYDRGQ6A0RNG0ElGlUXYaMKFB6DQ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");

            var linebreak = document.createElement("br");

            var title = document.createElement("h2");
            title.innerHTML = "Set a timer";
            title.style = "color: black";

            var box = document.createElement("Div");
            box.style = "z-index: 9999;background: white;border: none;border-top-left-radius: 5px;border-bottom-left-radius: 5px;box-sizing: content-box;color: rgb(255, 255, 255);overflow: hidden;padding: 0px 40px 40px 40px;position: fixed;text-align: center;text-overflow: ellipsis;width: 186px;top: 240px;left: 146px;";

            var input = document.createElement("input");
            input.className = "form-control";
            input.id = "durationInput";
            input.placeholder = "Time in minutes";
            input.style= "color:black;margin-left:0px;width:100%;";

            var button = document.createElement("Button");
            button.innerHTML = "Add Timer";
            button.className = "c-button c-button--big c-button--block c-button--primary";
            button.id = "timerButton";
            button.style = "z-index: 9999;";

            box.appendChild(title);
            box.appendChild(input);
            box.appendChild(linebreak);
            box.appendChild(button);
            document.body.appendChild(box);

            document.getElementById ("timerButton").addEventListener (
                "click", addTimer, false
            );

            function addTimer() {
                var duration = document.getElementById("durationInput").value * 60000;
                var headers = document.getElementsByClassName("WindowHeader");
                var title = headers[0].innerHTML;

                if (!Notification) {
                    alert('Desktop notifications not available in your browser.');
                    return;
                }
                setTimeout(function notify(){
                    if (Notification.permission !== "granted")
                        Notification.requestPermission();
                    else {

                        snd.play();

                        var notification = new Notification(title, {
                            icon: 'https://www.eslgaming.com/sites/all/themes/stability/stability_sub/logo.png',
                            body: duration/60000 + " minutes are over",
                        });

                        notification.onclick = function () {
                            window.focus();
                            this.close();
                        };

                    }
                }, duration);
            };
        }

        if (URL.isSupport()) {
            Support.addAdminQuickList();
            Protest.addSentences();

            // prototype for auto monthly finals
            var league = $('form[name=parentForm] td').filter(function() {
                return $(this).text() === 'League';
            }).next().text();

            // is about monthly finals?
            if (league.indexOf('Monthly Finals') !== -1) {
                var platform = '';
                // is ps4
                if (league.indexOf('PS4') !== -1) {
                    platform = 'ps4';
                }
                // is one
                if (league.indexOf('One') !== -1) {
                    platform = 'one';
                }
                // is one
                if (league.indexOf('PC') !== -1) {
                    platform = 'pc';
                }
                if (platform !== '') {
                    var player = $('td:contains(Anfragesteller)').next().find('a');

                    if (player.length > 1) {
                        var go4team = player.eq(1).text();
                        var go4teamLink = player.eq(1).attr('href');
                        var month = ("0" + (new Date().getMonth())).slice(-2);
                        var year = new Date().getUTCFullYear();
                        var toolboxLink = 'https://toolbox.tet.io/go4/go4r6_'+platform+'_eu/'+year+'-'+month+'/';

                        $.get(toolboxLink, function(data) {

                            var template = 'Team: <a href="'+go4teamLink+'">'+go4team+'</a><br />' +
                                'Ticket: <a href="'+ location.href +'">Ticket</a><br />' +
                                'Participation: Yes';
                            $('textarea[name=body]').after('<div>'+template+'</div>');

                            var ranking = $(data).find('td:contains('+go4team+')').prev().prev().text();
                            $('textarea[name=body]').parent().parent().parent().parent().parent().before('<a href="https://play.eslgaming.com/rainbowsix/forum/3326/35581/">Forum-Link</a> - <a href="'+toolboxLink+'">Ranking</a>: ' + ranking);
                        });
                    } else {
                        console.log('Cant find team name');
                    }
                } else {
                    console.log('Platform for Go4 Monthly finals not found');
                }
            }
        }

        if (URL.isAdminTickets() || GM_getValue("refreshCounterGlobal") === true) {
            setTimeout(function() {
                Menu.showTicketCounter();
                setInterval(Menu.showTicketCounter, 30000);
            }, 1000);
        }

        if (URL.isAdminMatch()) {
            AdminMatch.addMatchLink();
            AdminMatch.addProtestLink();

            // begin helper
            // remove MiniHelper Buttons
            $('.esl-content .btn').remove();

            function addActionButton(action, name, callback) {
                $('.esl-content h2').after('<a class="btn btn-primary action__'+ action +'" href="#checked">'+ name +'</a>');
                $('.action__' + action).on('click', callback);
            };

            var contestant1 = $('select[name=defaultwin] option').eq(1);
            var contestant2 = $('select[name=defaultwin] option').eq(2);

            function giveDefaultWin(contestant) {
                $('select[name=active]').val('yes');
                $('select[name=status]').val('closed');
                $('select[name=calculate]').val('yes');
                $('.esl-content input[type=checkbox][name!=featured]').attr('checked', true);
                $('select[name=defaultwin]').val(contestant);
                $('option:contains(No Exception)').parent().val($('option:contains(No Exception)').val())

                if (contestant == 1) {
                    $('td:contains(round1team1)').next().find('input').eq(1).val(1);
                    $('td:contains(round1team2)').next().find('input').eq(1).val(0);
                } else {
                    $('td:contains(round1team1)').next().find('input').eq(1).val(0);
                    $('td:contains(round1team2)').next().find('input').eq(1).val(1);
                }
            }

            addActionButton('default-win-2', 'Default Win ' + contestant2.text(), function() {
                giveDefaultWin(2);
            });
            addActionButton('default-win-1', 'Default Win ' + contestant1.text(), function() {
                giveDefaultWin(1);
            });

            addActionButton('delete-match', 'Delete', function() {
                $('select[name=active]').val('no');
                $('select[name=status]').val('exception');
                $('select[name=calculate]').val('no');
                $('select[name=defaultwin]').val('none');

                $('.esl-content input[type=checkbox][name!=featured]').attr('checked', true);

                $('option:contains(No Exception)').parent().val($('option:contains(No Exception)').next().val())
            });

            addActionButton('check-match', 'Check', function() {
                $('.esl-content input[type=checkbox][name!=featured]').attr('checked', true);
                $('select[name=active]').val('yes');
                $('select[name=status]').val('closed');
                $('select[name=calculate]').val('yes');
                $('select[name=defaultwin]').val('none');
                $('option:contains(No Exception)').parent().val($('option:contains(No Exception)').val())
            });
        }

        if (URL.isMatch()) {
            Match.addProtestLink();
            Match.addLinkPreview('Chatlog');
            Match.addLinkPreview('Logfile');
        }

        if (URL.isBracket()) {
            var rounds = [];
            var leagueId = $('league-interaction').attr('league_id');

            $.get('https://play.eslgaming.com/api/leagues/'+leagueId+'/results', function(data) {
                $.each(data, function(k, v) {
                    var round = v.round;
                    var begin = v.beginAt;

                    rounds[round] = begin;
                });

                $('div.round').each(function(k, v) {
                    var dueColor = 'black';
                    var tempBegin = rounds[$(v).attr('number') - 1];
                    var tempDate = new Date(tempBegin).toLocaleString();
                    var timeDiff = ((((tempBegin) - (new Date().getTime()))/1000)/60/60);
                    //console.log(timeDiff);

                    if (timeDiff < -1.25) dueColor = 'red';

                    $(v).prepend('<span style="color: '+dueColor+'">'+tempDate+'</span>');
                });
            });
        }
    }
}

class AdminMatch {
    static addMatchLink() {
        var link = window.location.href.replace('admin_match', 'match');
        var editMatch = $("div.esl-content h2:contains(Edit Match)");
        var oldText = editMatch.text().trim();
        editMatch.html('<a href="'+link+'">'+oldText+'</a>');
    }

    static addProtestLink() {
        var matchId = $('input[name=id][type=hidden]').val();
        var protestLink = location.href.substr(0, location.href.indexOf('admin_match')) + 'match/protest/' + matchId + '/';
        $("div.esl-content div:contains(Edit Match)").append(' - <a href="'+ protestLink +'">Protest</a>');
    }
}

class Match {
    static addProtestLink() {
        var protestLink = location.href.substr(0, location.href.indexOf('match')) + 'match/protest/' + matchId + '/';
        $('div.esl-content span.arrowlink:contains(Admin Match)').append('<span class="arrowlink"><a href="'+ protestLink +'" target="_parent">Protest</a></span>');
    }

    static addLinkPreview(name) {
        $('a:contains('+name+')').on('click', function() {
            $('#preview').remove();

            $.get($('a:contains('+name+')').attr('href'), function(response) {
                var content = '<table>' + $(response).find('.esl-content > table').html() + '</table>';

                $('a:contains('+name+')').parent().parent().append('<div id="preview">'+content+'</div>');
            });

            return false;
        });
    }
}

class Menu {
    static init() {
        // build menu
        var navnodeSwitch =
            '<table style="width: 100%;">' +
            Helper.makeSwitch('Realtime Ticket updates', 'refreshCounter') +
            Helper.makeSwitch('Unassigned Tickets Notification', 'notification') +
            Helper.makeSwitch('Ticket counter on all pages', 'refreshCounterGlobal') +
            Helper.makeText('Navnode', 'helperNavnode') +
            Helper.makeText('Ignore Squads', 'squadsIgnore') +
            '</table>';


        $('body').append('<div id="dialog" style="display: hidden;" title="Settings">'+navnodeSwitch+'</div>');
        $('#userbar_connection_status_text').on('click', function() {
            if ($('#dialog').dialog('isOpen') === true) {
                $('#dialog').dialog('close');
            } else {
                $('#dialog').dialog({
                    modal: true,
                    minWidth: 700,
                    resizable: false,
                    buttons: {
                        Ok: function() {
                            $(this).dialog('close');
                        }
                    }
                });
            }
        });

        // listener
        Helper.addSwitch(
            'refreshCounter',
            '.userbar_jslink_refreshCounter',
            function() {
                if (URL.isAdminTickets()) {
                    Menu.showTicketCounter();
                }
            },
            function() {
                $('.userbar_caption:contains(Admin)').animate({
                    color: '#FFFFFF',
                });

                $('.userbar_caption:contains(Admin)').text('Admin');
            }
        );

        Helper.addSwitch(
            'refreshCounterGlobal',
            '.userbar_jslink_refreshCounterGlobal',
            function() {
                Menu.showTicketCounter();
            },
            function() {
                if (!URL.isAdminTickets()) {
                    $('.userbar_caption:contains(Admin)').animate({
                        color: '#FFFFFF',
                    });

                    $('.userbar_caption:contains(Admin)').text('Admin');
                }
            }
        );

        Helper.addSwitch(
            'notification',
            '.userbar_jslink_notification',
            function(){}, function(){}
        );

        Helper.addInputListener('helperNavnode');
        Helper.addInputListener('squadsIgnore');

        Menu.addNavnodeSwitch();

        // add dependencies
        $('head').append('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">');
        $('head').append('<link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/css/select2.min.css" rel="stylesheet" />');
        $('head').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min.js"></script>');
        $('head').append('<script src="https://cdn.rawgit.com/zenorocha/clipboard.js/v1.6.0/dist/clipboard.min.js"></script>');

        // quick ticket assigner :)
        Menu.addUserbarLink('fastForward', 'forward', AdminTickets.fastForward);
        Menu.addUserbarLink('leagueInfos', 'info', Helper.getTodaysCups);

        setTimeout(function() {
            if (URL.isSupport()) {
                // quick search for selects
                $('select[name=country_squad]').select2();
                $('select[name=squad]').select2();
            }
        }, 1000);
    }

    static addNavnodeSwitch() {
        $('.userbar_caption:contains(Admin)').parent().on('click', function() {
            var helperNavnode = GM_getValue('helperNavnode');

            if (helperNavnode === undefined || helperNavnode === '') {
                helperNavnode = '/rainbowsix/europe-pc/';
                GM_setValue('helperNavnode', helperNavnode);
            }

            var MYURL=helperNavnode;
            var nodesToReplace=['support', 'admin_tickets', 'protest', 'player', 'team', 'admin_fakematches', 'admin_application'];
            var path=window.location.pathname;
            for (var i in nodesToReplace){
                var regex=new RegExp("(.*)" + nodesToReplace[i]);
                var matches;
                if (matches=path.match(regex)){
                    if (matches[1]==MYURL){continue;}
                    if (window.location.href.match(/esl.eu/)){path="/play" + path;}
                    path=path.replace(matches[1], MYURL);
                    window.location.pathname=path;
                }
            }
        });
    }

    static showTicketCounter() {
        if (GM_getValue('refreshCounter') === false) {
            return;
        }

        AdminTickets.getTickets(function(data) {
            // do not cound specific squads
            var notTheseSquads = AdminTickets.getIgnoredSquads();

            var openTickets = $(data).find('table').eq(1).find('tr td:nth-child(3) a.TextS' + notTheseSquads);
            var assignedTickets = $(data).find('table').eq(1).find('tr td:nth-child(3) a.TextSP' + notTheseSquads);

            var openTicketsCount = openTickets.length;
            var assignedTicketsCount = assignedTickets.length;

            if (openTicketsCount > 0) {
                $('.userbar_caption:contains(Admin)').animate({
                    color: '#FF0000',
                });
            } else {
                $('.userbar_caption:contains(Admin)').animate({
                    color: '#00FF00',
                });
            }

            // refresh counter
            var adminCountText = '('+ openTicketsCount +'/'+ assignedTicketsCount +')';
            $('.userbar_caption:contains(Admin)').text('Admin ' + adminCountText);

            // refresh admin page live
            var ticketTable = $(data).find('.esl-content > table');
            $('.esl-content > table').html(ticketTable.html());

            // refresh title for better overview
            $('title').html(adminCountText);
        });
    }

    static addUserbarLink(name, icon, callback) {
        var actionId = 'action__' + name;
        var link = '<a class="fa fa-'+icon+'" style="padding-top: 4px;font-size: 20px;"></a>';

        var userbar = '<div id="'+actionId+'" class="userbar_item">';
        userbar += link
        userbar += '</div>';

        $('.userbar.chatbar').append(userbar);
        $('#' + actionId).on('click', callback);
    }
}

class URL {
    static isAdminTickets() {
        return window.location.href.indexOf("/admin_tickets/") > -1;
    }

    static isAdminMatch() {
        return window.location.href.indexOf("/admin_match/") > -1;
    }

    static isMatch() {
        return window.location.href.indexOf("/match/") > -1;
    }

    static isBracket() {
        return (window.location.href.indexOf("/rankings/") > -1 && $(".league--header .description").text().indexOf("Cup") > -1);
    }

    static isLeagueResults() {
        return (window.location.href.indexOf("/results/") > -1 && $(".league--header .description").text().indexOf("League") > -1);
    }

    static isProtest() {
        return window.location.href.indexOf("/protest/") > -1;
    }

    static isSupport() {
        return window.location.href.indexOf("/support/") > -1;
    }
}

class Support {
    static addAdminQuickList() {
        // build list
        var help = $('tr td a:contains(Help)');
        var options = '<option value="">-</option>';
        var adminSquad = $('input[name=adminsquad]').val();

        help.parent().html('<select id="adminList">'+ options +'</select>');

        $.getJSON("https://spreadsheets.google.com/feeds/list/1ySB3NhUelKmwIIGxzQEcwcjVgeDoeXOpWt7P7Ki5H6Y/opznj7h/public/values?alt=json", function(data) {
            $.each(data.feed.entry, function(key, value) {
                $('#adminList')
                    .append('<option value="'+ value.gsx$id.$t +':'+adminSquad+'">'+ value.gsx$name.$t +' ('+ value.gsx$position.$t +')</option>');
            });
        });

        // event listener
        $('#adminList').on('change', function(element) {
            $('input[name=directtoadmin]').val($(element.currentTarget).val());
        });
    }
}

class Protest {
    static addAdminMatchLink() {
        var match = $('td:contains(Match):not(.WindowHeader)').eq(0).next();
        var link = match.find('a').attr('href');

        match.append(' | <a href="'+ link.replace('match', 'admin_match') +'">Admin Match</a>');
    }

    static addSentences() {
        // check if we are in support/protest ticket
        if ($('select.defaultAnswerTexts[data-language=en]').length === 0) {
            return;
        }

        // read pretext
        var originalText = $('textarea[name=body]').val();
        var salutationRegex = '((Hello .+,)(\nhello .+)?)';
        var endwordRegex = '(Best regards,\n.+)';
        var defaultOptions = $('select.defaultAnswerTexts[data-language=en]').find('option').filter(function() {
            return $(this).data("id") < 100;
        });

        $('select.defaultAnswerTexts[data-language=en]').html('');
        $('select.defaultAnswerTexts[data-language=en]').append('<optgroup label="Default" id="defaultGroup"></optgroup>');
        $('#defaultGroup').append(defaultOptions);
        $('select.defaultAnswerTexts[data-language=en]').prepend('<optgroup id="customGroup" label="Custom"></optgroup>');

        $.getJSON("https://spreadsheets.google.com/feeds/list/1ySB3NhUelKmwIIGxzQEcwcjVgeDoeXOpWt7P7Ki5H6Y/od6/public/values?alt=json", function(data) {
            $.each(data.feed.entry, function(key, value) {
                $('select.defaultAnswerTexts[data-language=en]').find('optgroup#customGroup')
                    .append($("<option></option>")
                            .data('id', value.gsx$id.$t)
                            .data('text', originalText.replace('\n\n\n', '\n\n'+ value.gsx$text.$t +'\n'))
                            .text(value.gsx$label.$t));
            });

            $('select.defaultAnswerTexts[data-language=en]').val('Blank address');
        });
    }
}

class Helper {
    static addSwitch(name, className, callbackOn, callbackOff) {
        $(className).on('click', function() {
            if (GM_getValue(name) === true) {
                GM_setValue(name, false);
                $(className).text('OFF');
                $(className).addClass('btn-danger');
                $(className).removeClass('btn-success');

                callbackOff();
                return;
            }

            if (GM_getValue(name) === false) {
                GM_setValue(name, true);
                $(className).text('ON');
                $(className).addClass('btn-success');
                $(className).removeClass('btn-danger');

                callbackOn();
                return;
            }

            return GM_setValue(name, false);
        });
    }

    static addInputListener(name) {
        $('#' + name).on('keyup', function(e) {
            GM_setValue(name, $(e.target).val());
        });
    }

    static makeSwitch(name, switchName) {
        return '<tr><td>'+ name +'</td><td>'+ Helper.getSwitch(switchName) +'</td></tr>';
    }

    static makeText(name, textName) {
        return '<tr><td>'+ name +'</td><td>'+ Helper.getText(textName) +'</td></tr>';
    }

    static getText(name) {
        var value = GM_getValue(name);

        if (value === undefined) {
            value = '';
            GM_setValue(name, value);
        }

        return '<input type="text" id="'+name+'" value="'+value+'" />';
    }

    static getSwitch(name) {
        var status, btnClass;
        var value = GM_getValue(name);

        if (value === true) {
            status = 'ON';
            btnClass = 'btn-success';
        } else {
            status = 'OFF';
            btnClass = 'btn-danger';
        }

        return '<a class="btn btn-xsmall '+btnClass+' userbar_jslink_'+name+'">'+status+'</a>';
    }

    static getTodaysCups() {
        var cups = [];
        var date = new Date();
        var data = {
            path: '/play/rainbowsix/europe-pc/',
            states: 'inProgress,upcoming',
            skill_levels: 'open,major',
            types: 'cup,swiss',
            'limit.total': 30,
        };

        function fetchLeague(path) {
            data.path = path;

            $('.l-main').html('');

            $.get('https://play.eslgaming.com/api/leagues', data, function(data) {
                $.each(data, function(key, value) {
                    if (value.timeline.inProgress.begin.indexOf(date.toISOString().substr(0, 10)) != -1) {
                        $('.l-main').append('<a style="font-size:10px;" href="'+ value.uri +'/rankings/">' + value.name.full + '</a><br />');
                    }
                });
            });
        }

        fetchLeague('/play/rainbowsix/europe-pc/');
        fetchLeague('/play/rainbowsix/europe-one/');
        fetchLeague('/play/rainbowsix/europe-ps4/');
    }
}

class XMPP {
    static connect() {
        teXmppConnectionControl.setStatus('available', true);
        teXmppConnectionControl.connect();
    }

    static disconnect() {
        teXmppConnectionControl.disconnect(true);
    }

    static toggleGhost() {
        XMPP.ghostHandler('toggle');
    }

    // Common Cookie Toggle Handler
    static cookieToggleHandler( option, cookie, enableText, disableText, target, enableValue )
    {
        var enabled = jQuery.cookie( cookie );

        if( option == 'toggle' )
        {
            if( enabled )
            {
                enabled = null;
            }
            else
            {
                enabled = enableValue;
            }

            jQuery.cookie( cookie, enabled, {expires: 365, path: '/'} );
        }

        var text = enableText;
        if( enabled )
        {
            text = disableText;
        }
        jQuery( '#' + target ).html( text );

        if( option == 'toggle' )
        {
            teUserbarManager.refresh();
        }
    }

    // Ghost Cookie
    static ghostHandler( option ) {
        XMPP.cookieToggleHandler( option, 'ghost', 'Enable Ghost', 'Disable Ghost', 'ghostHandler', ghostKey );
    }

    // 404 Cookie
    static fnfHandler( option ) {
        XMPP.cookieToggleHandler( option, 'no404', 'Enable 404', 'Disable 404', 'fnfHandler', 1 );
    }

    // Debug Cookie
    static debugHandler( option ) {
        //jQuery.cookie( 'debug_version', 'old' );
        XMPP.cookieToggleHandler( option, 'show_debug_code', 'Show Debug', 'Hide Debug', 'debugHandler', 'true' );
    }

    // Profile Cookie
    static profileHandler( option ) {
        XMPP.cookieToggleHandler( option, 'profile', 'Enable Profiling', 'Disable Profiling', 'profileHandler', 'true' );
    }
}

class AdminTickets {
    static getTickets(callback) {
        $.get('https://play.eslgaming.com/admin_tickets/', callback);
    }

    static getIgnoredSquads() {
        var squadsIgnore = GM_getValue('squadsIgnore');
        var notTheseSquads = '';

        /*$.each(squadsIgnore.split(','), function(key, value) {
            notTheseSquads += ':not([href$="squad='+value+'"])';
        });*/

        return notTheseSquads;
    }

    static fastForward() {
        AdminTickets.getTickets(function(data) {
            var notTheseSquads = AdminTickets.getIgnoredSquads();
            var openTickets = $(data).find('table').eq(1).find('tr td:nth-child(3) a.TextS' + notTheseSquads);

            if (openTickets.length > 0) {
                window.location = 'https://play.eslgaming.com' + openTickets.first().attr('href');
            } else {
                alert('No open ticket found.');
            }
        });
    }
}

(function() {
    'use strict';

    App.init();
})();

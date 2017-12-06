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

            var snd = new Audio("../audio/alert.ogg")

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
                            .attr('data-id', value.gsx$id.$t)
                            .attr('data-text', originalText.replace('\n\n\n', '\n\n'+ value.gsx$text.$t +'\n'))
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

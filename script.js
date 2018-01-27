var baseURL = 'https://wind-bow.gomix.me/twitch-api/',
    route = 'default';
var users = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

var userRD = {}, userFD = {}, saveUFD = {fcc: [], online: [], offline: []};

function getURD(username, dataT, routeT) {
    var route = routeT || 'users/'

    $.ajax({ url: (baseURL +route+username), dataType: "jsonp" })
    .done(function(data, textStatus) {
        userRD[username].push(data);
    })
    .fail(function(error, textStatus) {        
        console.log(error, textStatus);
        return $(".error").fadeIn(300);
    })
    .always(function(data, textStatus) {
        if(dataT == "user") return getURD(username, "channel", "channels/");
        if(dataT == "channel") return getURD(username, "stream", "streams/");
    });
};

function formatURD(user) {
    var ui = user[0], ci = user[1], si = user[2];
    var data = {
        name: ui.name,
        display_name: ui.display_name,
        bio: ui.bio,
        logo: ui.logo,
        channel: ci.url
    };
    if(si.stream != null) {
        si = si.stream.channel;
        data.online = true; data.game = si.game; data.status = si.status;
    }
    if(!userFD.hasOwnProperty(data.name)) userFD[data.name] = data;
};

function prepareUFD (users) {
    var fccicon = $("#fcc-icon-template").html(), onlineicon = $("#online-icon-template").html(),
        offlineicon = $("#offline-icon-template").html();

    for(var user in users) {
        user = users[user];
        var logo = (user.logo !== null) ? user.logo : "https://maxcdn.icons8.com/Share/icon/Logos//twitch1600.png",
            bio = (user.bio !== null) ? user.bio : "Biography not found",
            stream = user.online ? user.game +': '+ user.status : 'Not Streaming',
            icon = fccicon,
            type = 'freecodecamp';

        if(user.name != 'freecodecamp'){
            icon = user.online ? onlineicon : offlineicon;
            type = user.online ? 'online' : 'offline';
        } else {
            type = user.online ? 'freecodecamp online' : 'freecodecamp offline';
        }
         
        var contentTemplate = $("#user-template-new").html()
            .replace(/{usertype}/g, type)
            .replace(/{logo}/g, logo)
            .replace(/{bio}/g, bio)
            .replace(/{icon}/g, icon)
            .replace(/{display_name}/g, user.display_name)
            .replace(/{stream}/g, stream)
            .replace(/{channel}/g, user.channel);

        if (user.name == 'freecodecamp') {saveUFD.fcc.push(contentTemplate); continue; }
        if (user.online) {saveUFD.online.push(contentTemplate); continue; }
        saveUFD.offline.push(contentTemplate);
    };

    showUFD('all');
};

function showUFD (type) {
    var content = $("<div class=\"users\"></div>");

    if(type == 'all'){
        for(var i = 0; i < saveUFD.offline.length; i++) { content.append($(saveUFD.offline[i])); }
        for(var i = 0; i < saveUFD.online.length; i++) { content.prepend($(saveUFD.online[i])); }
   }
    if(type == 'online') {
        for(var i = 0; i < saveUFD.online.length; i++) { content.prepend($(saveUFD.online[i])); }
    }
    if(type == 'offline') {
        for(var i = 0; i < saveUFD.offline.length; i++) { content.append($(saveUFD.offline[i])); }
    }

    content.prepend($(saveUFD.fcc[0]));
    // $(".users").remove();
    // $('#main').append(content);

    $("#main").fadeOut(300, function() {
        $(".users").remove();
        $('#main').append(content);
        
        $("#main").fadeIn(300, function() {
            $(".showbio").on("click", function(e) {
                $(this).parent(".top").siblings('.bio').fadeToggle( "slow", "linear" );
                e.preventDefault();
            });
            $(".closebio").on("click", function(e) {
                $(this).parents(".bio").fadeToggle( "slow", "linear" );
                e.preventDefault();
            });                    
        });
    });
};

function attachEvents () {
    $("#all").on("click", function(e) {
        showUFD('all');
        e.preventDefault();
    });
    $("#online").on("click", function(e) {
        showUFD('online');
        e.preventDefault();
    });
    $("#offline").on("click", function(e) {
        showUFD('offline');
        e.preventDefault();
    });
};

function init() {
    for(var i = 0; i < users.length; i++) {
        if(!userRD.hasOwnProperty(users[i])) {userRD[users[i]] = [];}
        getURD(users[i], "user", "users/")
    };
    
    $(document).ajaxStop(function() {
        for(let user in userRD) {formatURD(userRD[user]);};
        prepareUFD(userFD);
        attachEvents();
    
        $("#wrapper").fadeIn(500);
    });
    
    $(window).scroll(function(e) {
        if($(window).scrollTop() >= 30) {
            $(".header").css("background-color", "#342863");
        } else {
            $(".header").css("background-color", "transparent");        
        }
    });
}

init();
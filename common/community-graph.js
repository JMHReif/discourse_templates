//Weekly and Community banners
var endpoint = "https://communityapi.neo4jlabs.com/";

function avatar(data) {
    return (
        "<a href='/users/" + data.name + "' alt='" + (data.name || data.screenName) + "'>" +
        "<img alt='" + data.name + "' class='avatar' src='" + data.avatar + "'/> " +
        "</a>"
    );
}

function contentLink(title, url) {
    return "<a class='community content' href='" + url + "'>" + title + "</a>";
}

function userTile(data) {    
    return ('<div class="user tile">' +
        avatar(data) + 
        // "<a href='/users/" + data.name + "'>" +
        // (data.name || data.screenName) +
        // "</a>" +
        '</div>');
}

function progLanguage (lang) {
    // Need image tile
    return '<div class="proglanguage">' + lang + '</div>';
}

function dateFormat(str) {
    var d = new Date(str);
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    var month = months[d.getMonth()];
    var year = d.getFullYear();
    var dt = d.getDate();

    return month + ' ' + dt + ', ' + year;
}

var combinedQuery = `{
    topCommunityBlogsAndContent(first:5) { 
        title
        url
        author {
          name
          screenName
          avatar
        }
    }                    
    topNewCertifiedDevelopers(first:5) {
        developer {
            name
            screenName
            avatar
        }
    }
    topCommunityOpenSourceProjects(first:5) {
        title
        url
        description
        releaseDate
        language
        author {
          name
          screenName
          avatar
        }
    }
    thisWeekInNeo4j {
        featuredCommunityMember{
            image
        }
        features {
            tag
            url
        }
        articles {
            tag
            url
        }
        date
        url
        text
    }
}`;

var handlers = {
    topContent: {
         handler: data => {
            var content = data.data.topCommunityBlogsAndContent;

            content.map(article => {
                $("table#communityBlogs").append('<tr class="community blogs"><td class="blogs"> ' +
                    avatar(article.author) + '</td><td> ' +
                    contentLink(article.title, article.url) + '</td></tr>'
                );
            });
         }
    },
    topDevs: {
        handler: data => {
            var devs = data.data.topNewCertifiedDevelopers;

            devs.map(obj => obj.developer).forEach(dev => {
                $("table#devList").append('<tr class="developer"><td class="dev"> ' +
                avatar(dev) + '</td><td> ' +
                contentLink(dev.screenName || dev.name, '/users/' + dev.name) + '</td></tr>');
            });
        }
    },
    topProjects: {
        handler: data => {
            var projs = data.data.topCommunityOpenSourceProjects;

            // Take first 5 only
            projs.slice(0,5).map(proj => {
                $("table#communityOpenSource").append('<tr class="open source"><td class="proj"> ' +
                userTile(proj.author) + '</td><td> ' +
                contentLink(proj.title, proj.url) + '</td><td> ' +
                progLanguage(proj.language) + '</td></tr>');
            });
        }
    },
    twin4j: {
        handler: data => {
            var twin4j = data.data.thisWeekInNeo4j;
            var featuredMember = twin4j.featuredCommunityMember;
            var features = twin4j.features;

            $("div#twin4jContainer").append(
                '<h3>' + contentLink(twin4j.date, twin4j.url) + '</h3>' +
                '<p class="weekly box">' + 
                features.map(feature => '<li>' + contentLink(feature.tag, feature.url) + '</li>').join('\n') +
                '</p>'
            );

            // Featured comm member.
            $("div#featuredDeveloper").append(
                contentLink("<img style='height: 75%; width: 75%; object-fit: contain' class='featured member' src='" + featuredMember.image + "' alt='" +
                twin4j.date + "'" + 
                "/>", twin4j.url)
            )
        }
    }
}

function genericError(err) {
    console.error('Kudos to Nav; ', err);
}

function graphQL(query, success, fail) {
    if (!fail) {
        fail = genericError;
    }
    
    return $.ajax({
        url: endpoint,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            operationName:null,
            variables: {},
            query: query
        }),
        success: success,
        error: fail
    });
}

function pageReady() {
    graphQL(combinedQuery, data => {
        Object.keys(handlers).map(key => {
            var pkg = handlers[key];
            var handler = pkg.handler;

            handler(data);            
        })
    }, genericError);
}

$(document).ready(pageReady);

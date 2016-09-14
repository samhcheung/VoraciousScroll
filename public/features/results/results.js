angular.module('smartNews.results', [])

.controller('ResultsCtrl', function($scope, $stateParams, $http, isAuth, saveArticle, renderGraph) {

  $scope.articleReceived = $stateParams.articleReceived;

  $scope.selectedDate = renderGraph.selectedDate;

  $scope.isAuth = function() {
    $scope.user = isAuth();
    return !!isAuth();
  };


  $scope.clickSave = function(el){
    var now = new Date();

    var article = {
      title: el.title,
      author: el.author.name,
      publishDate: el.publishedAt,
      savedDate: now,
      articleLink: el.links.permalink,
      articleSource: el.source.name,
      img: el.media[0].url,
      body: el.body
    };
    saveArticle(article);
  };

  $scope.getArticle = function() {
    //Load the chart if taken to this results area
    var input = $stateParams.input;

    var chartUrl = '/results/' + input;
    if (input) {
      $http({
        method: 'GET',
        url: chartUrl
      })
      .then(
        function(obj){
          renderGraph.renderGraph(obj);
        },
        function(error){
          console.log('Error', error);
        }
      );
    } else {
      $state.go('main.home');
    }




    var publishStart = $scope.selectedDate.startDate;
    var publishEnd = $scope.selectedDate.endDate;

    var articleUrl = '/seearticle?input=' + '"'+ input +'"' + '&start=' + publishStart + '&end=' + publishEnd;

    $http({
      method: 'GET',
      url: articleUrl
    }).then(
      function(data) {
        $scope.articleReceived = true;
        $scope.articles = data.data.stories;
      },
      function(err) {
        console.log('THERE WAS AN ERROR RECEIVING DATA FROM SEEARTICLE', err);
      }
    );
  };
  // Render article
  $scope.getArticle();
  // Render new articles on graph click
  $scope.$on('user:clickDate', function(event, data) {
    $scope.getArticle();
  });

})
.directive('resultarticle', function() {
  return {
    templateUrl: 'features/results/article.html'
  };
});


/*

var testData = [{"id":19897220,"title":"The Chainsmokers' 'Closer' Went Platinum And Halsey Cannot Deal","body":"Music\n \n \n \n \n Looks like The Chainsmokers will have to share that disc with The Fray\n \n \n \n \n \n \n \n \n \n The Chainsmokers' hit song \"Closer\" just went platinum, and the duo got to surprise their guest artist Halsey with the news on camera.\n A new video on The Chainsmokers' Snapchat shows them sharing the good news with Halsey while she chills on the set of the song's forthcoming music video. \"Shut the fuck up!\" she screams before everyone celebrates with a solid round of hugs.\n \"Closer\" also just jumped to the top of the Billboard Hot 100, edging out Sia's first No. 1 hit, \"Cheap Thrills.\" \n Interestingly enough, the EDM duo have quietly shared their success with another unexpected collaborator: the rock band The Fray, who now have a retroactive songwriting credit on \"Closer.\" The main synth line on \"Closer\" sounds a whole lot like the piano line on The Fray's 2005 hit \"Over My Head (Cable Car),\" so to avoid being sued like Ed Sheeran or Demi Lovato, The Chainsmokers just went ahead and gave them credit for the riff.\n The Fray's guitarist Joe King acknowledged the nod on Instagram last week, writing that he was \"thrilled to be a part of the #1 song in the country right now.\"\n I guess you never know when a tiny part of your guitar rock song will go platinum via an EDM hit 11 years later.","summary":{"sentences":["Music\n \n \n \n \n Looks like The Chainsmokers will have to share that disc with The Fray\n \n \n \n \n \n \n \n \n \n The Chainsmokers' hit song \"Closer\" just went platinum, and the duo got to surprise their guest artist Halsey with the news on camera.","A new video on The Chainsmokers' Snapchat shows them sharing the good news with Halsey while she chills on the set of the song's forthcoming music video.","Interestingly enough, the EDM duo have quietly shared their success with another unexpected collaborator: the rock band The Fray, who now have a retroactive songwriting credit on \"Closer.\"","The Fray's guitarist Joe King acknowledged the nod on Instagram last week, writing that he was \"thrilled to be a part of the #1 song in the country right now.\"","I guess you never know when a tiny part of your guitar rock song will go platinum via an EDM hit 11 years later."]},"source":{"id":8,"name":"MTV News","title":"MTV News Headlines","description":"Online news from Music Television focusing on rock, metal, rap, hip hop, rhythm and blues, and pop.","linksInCount":38052,"homePageUrl":"http://www.mtv.com/news","domain":"mtv.com","locations":[],"scopes":[],"rankings":{"alexa":[{"rank":2066,"fetchedAt":"2016-08-22T16:46:39.000Z"},{"rank":3255,"country":"IN","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":4373,"country":"ID","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":12567,"country":"RU","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":511,"country":"PH","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":6060,"country":"ES","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":4169,"country":"PK","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":847,"country":"US","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1321,"country":"IE","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":2033,"country":"AU","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":3534,"country":"PL","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1322,"country":"NG","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1557,"country":"SE","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1329,"country":"GB","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":6290,"country":"FR","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":5196,"country":"KR","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":3839,"country":"BR","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":4374,"country":"IT","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1388,"country":"GR","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1219,"country":"ZA","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":2458,"country":"MX","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1787,"country":"NL","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":1503,"country":"CA","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":3106,"country":"CN","fetchedAt":"2016-08-22T16:46:40.000Z"},{"rank":3415,"country":"DE","fetchedAt":"2016-08-22T16:46:40.000Z"}]}},"author":{"id":1193,"name":"Sasha Geffen"},"entities":{"title":[{"text":"The Chainsmokers","score":0.9999999999957652,"types":["Band"],"links":{"dbpedia":"http://dbpedia.org/resource/The_Chainsmokers"},"indices":[[0,15]]}],"body":[{"text":"The Fray","score":0.9999999962494712,"types":["Band"],"links":{"dbpedia":"http://dbpedia.org/resource/The_Fray"},"indices":[[114,121],[809,816],[952,959],[1129,1136]]},{"text":"Billboard Hot 100","score":0.6332675019954559,"types":["Magazine","product"],"links":{"dbpedia":"http://dbpedia.org/resource/Billboard_(magazine)"},"indices":[[612,628]]},{"text":"Ed Sheeran","score":1,"types":["MusicalArtist","Person"],"links":{"dbpedia":"http://dbpedia.org/resource/Ed_Sheeran"},"indices":[[1028,1037]]},{"text":"Instagram","score":1,"types":["Software","product"],"links":{"dbpedia":"http://dbpedia.org/resource/Instagram"},"indices":[[1183,1191]]},{"text":"Snapchat","score":1,"types":["Software","product"],"links":{"dbpedia":"http://dbpedia.org/resource/Snapchat"},"indices":[[354,361]]},{"text":"EDM","score":0.9999999994059863,"types":["Organisation"],"links":{"dbpedia":"http://dbpedia.org/resource/Electronic_dance_music"},"indices":[[715,717],[1384,1386]]},{"text":"The Chainsmokers","score":1,"types":["Band"],"links":{"dbpedia":"http://dbpedia.org/resource/The_Chainsmokers"},"indices":[[63,78],[180,195],[336,351],[1055,1070]]},{"text":"Sia","score":1,"types":["MusicalArtist"],"links":{"dbpedia":"http://dbpedia.org/resource/Sia_(musician)"},"indices":[[642,644]]},{"text":"Joe King","score":0.8203483013528223,"types":["Band","Person"],"links":{"dbpedia":"http://dbpedia.org/resource/The_Queers"},"indices":[[1150,1157]]},{"text":"Cheap Thrills","score":1,"types":["Album","product"],"links":{"dbpedia":"http://dbpedia.org/resource/Cheap_Thrills"},"indices":[[666,678]]},{"text":"Demi Lovato","score":1,"types":["Person"],"links":{"dbpedia":"http://dbpedia.org/resource/Demi_Lovato"},"indices":[[1042,1052]]},{"text":"Cable Car","types":["Organisation"],"indices":[[987,995]]}]},"keywords":["Chainsmokers","Deal","Platinum","Halsey","The Chainsmokers","Fray","music video","song","rock","credit","video","news","Music","platinum","success","Cheap","Billboard","Thrills","The Fray","Billboard Hot 100","Ed Sheeran","Instagram","Snapchat","EDM","Sia","Joe King","Cheap Thrills","Demi Lovato"],"hashtags":["#TheChainsmokers","#TheFray","#EDM","#ElectronicDanceMusic","#Snapchat","#Sia","#Billboard","#DemiLovato","#EdSheeran","#CheapThrills","#TheQueers","#Instagram"],"charactersCount":1407,"wordsCount":235,"sentencesCount":9,"paragraphsCount":21,"categories":[{"id":"IAB1-6","taxonomy":"iab-qag","level":2,"score":0.46804158298977644,"confident":true,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB1-6","parent":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB1"}},{"id":"IAB1","taxonomy":"iab-qag","level":1,"score":0.14524364188025368,"confident":true,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB1"}},{"id":"01011000","taxonomy":"iptc-subjectcode","level":2,"score":1,"confident":true,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iptc-subjectcode/01011000","parent":"https://api.aylien.com/api/v1/classify/taxonomy/iptc-subjectcode/01000000"}}],"socialSharesCount":{"facebook":[{"count":16817,"fetchedAt":"2016-09-09T12:24:32.000Z"},{"count":11665,"fetchedAt":"2016-09-09T06:29:50.000Z"},{"count":4472,"fetchedAt":"2016-09-09T02:07:31.000Z"},{"count":14,"fetchedAt":"2016-09-08T18:53:50.000Z"}],"googlePlus":[{"count":1,"fetchedAt":"2016-09-09T12:33:02.000Z"},{"count":1,"fetchedAt":"2016-09-09T06:47:53.000Z"},{"count":1,"fetchedAt":"2016-09-09T00:56:43.000Z"},{"count":1,"fetchedAt":"2016-09-08T19:15:50.000Z"}],"linkedin":[{"count":2,"fetchedAt":"2016-09-09T12:33:02.000Z"},{"count":2,"fetchedAt":"2016-09-09T06:47:53.000Z"},{"count":2,"fetchedAt":"2016-09-09T00:56:43.000Z"},{"count":2,"fetchedAt":"2016-09-08T19:15:50.000Z"}],"reddit":[{"count":0,"fetchedAt":"2016-09-09T10:22:07.000Z"},{"count":0,"fetchedAt":"2016-09-08T23:39:17.000Z"}]},"media":[{"type":"image","url":"http://imagesmtv-a.akamaihd.net/uri/mgid:ao:image:mtv.com:208400?quality=0.8&format=jpg&width=1440&height=810&.jpg"}],"sentiment":{"title":{"polarity":"negative","score":0.498628},"body":{"polarity":"positive","score":1}},"language":"en","publishedAt":"2016-09-08T16:24:16.000Z","links":{"permalink":"http://www.mtv.com/news/2929365/halsey-chainsmokers-closer-platinum/","relatedStories":"https://api.newsapi.aylien.com/api/v1/related_stories?story_id=19897220","coverages":"https://api.newsapi.aylien.com/api/v1/coverages?story_id=19897220"}}, {"id":19880072,"title":"Why Everyone Wants To Work With The Chainsmokers Right Now","body":"Halsey has been a rising star for some time now, but this is her first real chart-topper hit as the featuring artist on The Chainsmokers’ track Closer. The song has literally catapulted into the mainstream, bringing Halsey along with it. The same is true for up-and-comer Daya, who worked with The Chainsmokers on their smash hit Don't Let Me Down earlier this year.","summary":{"sentences":["Halsey has been a rising star for some time now, but this is her first real chart-topper hit as the featuring artist on The Chainsmokers’ track Closer.","The song has literally catapulted into the mainstream, bringing Halsey along with it.","The same is true for up-and-comer Daya, who worked with The Chainsmokers on their smash hit Don't Let Me Down earlier this year."]},"source":{"id":30,"name":"Forbes","title":"Forbes Magazine","description":"Information about companies and the people who run them. Forbes success lists including the Platinum 400 best-performing U.S. big companies, the Private 500 largest U.S. private firms, and the world's richest people.","linksInCount":198319,"homePageUrl":"http://www.forbes.com/","domain":"forbes.com","locations":[{"country":"US"}],"scopes":[{"country":"US","level":"national"},{"level":"international"}],"rankings":{"alexa":[{"rank":224,"fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":154,"country":"IN","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":509,"country":"ID","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":115,"country":"SG","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":219,"country":"MY","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":174,"country":"PH","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":550,"country":"ES","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":198,"country":"PK","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":84,"country":"US","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":243,"country":"HK","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":112,"country":"IE","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":1008,"country":"IR","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":162,"country":"AU","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":119,"country":"NG","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":120,"country":"GB","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":606,"country":"FR","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":467,"country":"KR","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":1022,"country":"BR","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":626,"country":"IT","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":180,"country":"ZA","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":114,"country":"CA","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":1286,"country":"CN","fetchedAt":"2016-08-22T16:46:48.000Z"},{"rank":487,"country":"DE","fetchedAt":"2016-08-22T16:46:48.000Z"}]}},"author":{"id":31351,"name":"Liv Buli"},"entities":{"title":[{"text":"The Chainsmokers","score":0.9999999999977689,"types":["Band"],"links":{"dbpedia":"http://dbpedia.org/resource/The_Chainsmokers"},"indices":[[32,47]]}],"body":[{"text":"Down","score":0.6727084321112946,"types":["Settlement"],"links":{"dbpedia":"http://dbpedia.org/resource/County_Down"},"indices":[[343,346]]},{"text":"The Chainsmokers","score":1,"types":["Band"],"links":{"dbpedia":"http://dbpedia.org/resource/The_Chainsmokers"},"indices":[[120,135],[294,309]]}]},"keywords":["The Chainsmokers","Chainsmokers","Halsey","real","up-and-comer","Daya","true","track","chart-topper","artist","song","mainstream","time","smash","star","year","Down"],"hashtags":["#TheChainsmokers","#CountyDown","#Star"],"charactersCount":366,"wordsCount":67,"sentencesCount":3,"paragraphsCount":1,"categories":[{"id":"IAB1-6","taxonomy":"iab-qag","level":2,"score":0.2151397038050213,"confident":false,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB1-6","parent":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB1"}},{"id":"IAB9","taxonomy":"iab-qag","level":1,"score":0.08708445736553665,"confident":true,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB9"}},{"id":"IAB1","taxonomy":"iab-qag","level":1,"score":0.08567640193605572,"confident":true,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB1"}},{"id":"IAB9-16","taxonomy":"iab-qag","level":2,"score":0.06700930289440116,"confident":false,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB9-16","parent":"https://api.aylien.com/api/v1/classify/taxonomy/iab-qag/IAB9"}},{"id":"01023000","taxonomy":"iptc-subjectcode","level":2,"score":0.9971966664722423,"confident":true,"links":{"self":"https://api.aylien.com/api/v1/classify/taxonomy/iptc-subjectcode/01023000","parent":"https://api.aylien.com/api/v1/classify/taxonomy/iptc-subjectcode/01000000"}}],"socialSharesCount":{"facebook":[{"count":7,"fetchedAt":"2016-09-09T12:21:19.000Z"},{"count":7,"fetchedAt":"2016-09-09T06:27:43.000Z"},{"count":6,"fetchedAt":"2016-09-09T00:31:03.000Z"},{"count":4,"fetchedAt":"2016-09-08T18:50:26.000Z"}],"googlePlus":[{"count":1,"fetchedAt":"2016-09-09T12:24:20.000Z"},{"count":1,"fetchedAt":"2016-09-09T06:39:10.000Z"},{"count":1,"fetchedAt":"2016-09-09T00:48:01.000Z"},{"count":1,"fetchedAt":"2016-09-08T19:07:03.000Z"}],"linkedin":[{"count":0,"fetchedAt":"2016-09-09T12:24:22.000Z"},{"count":0,"fetchedAt":"2016-09-09T06:39:10.000Z"},{"count":0,"fetchedAt":"2016-09-09T00:48:01.000Z"},{"count":0,"fetchedAt":"2016-09-08T19:07:03.000Z"}],"reddit":[{"count":0,"fetchedAt":"2016-09-09T09:58:34.000Z"},{"count":0,"fetchedAt":"2016-09-08T23:15:33.000Z"}]},"media":[{"type":"image","url":"http://specials-images.forbesimg.com/imageserve/597574934/640x434.jpg?fit=scale"}],"sentiment":{"title":{"polarity":"negative","score":0.552988},"body":{"polarity":"positive","score":0.97561}},"language":"en","publishedAt":"2016-09-08T14:02:51.000Z","links":{"permalink":"http://www.forbes.com/sites/livbuli/2016/09/08/why-everyone-wants-to-work-with-the-chainsmokers-right-now/","relatedStories":"https://api.newsapi.aylien.com/api/v1/related_stories?story_id=19880072","coverages":"https://api.newsapi.aylien.com/api/v1/coverages?story_id=19880072"}}]

*/
var progressTimer,learningTimer,learningTimerKillswitch,draggee,setProgressTimer,myRand=new Math.seedrandom("hello"),trueMagic=-1,guessMagic=-1,testImgNameArrays=[],trainImgNameArrays=[],numberObjs=[],activeNumObj={},sortCount=0,maxSortCount=-1,numObjCount=0,myP5=new p5,augustaOffsetHistory=[],augustaOffset=0,learningRate=7,oldMax=0,singleNumberElem='<div class="single-number shadow rounded" draggable="true"><img src=""></div>';function updateGUI(){$("label").each(function(){var e=$(this).siblings('input[type="range"]'),t=e.val(),a=parseInt(e.attr("max"));$("#app").hasClass("sandbox")?$(this).text(t+" / "+a):$(this).text(t)})}function initNumberListeners(){$(".sorter").off("dragenter"),$(".sorter").off("dragover"),$(".sorter, .pending").off("drop"),$(".single-number").off("dragstart"),$(".sorter, .pending").on("dragenter",dragenter),$(".sorter, .pending").on("dragover",dragover),$(".sorter, .pending").on("drop",pendingSortDrop),$(".single-number").on("dragstart",dragstart),$("body").on("click",".single-number",function(e){var t=$(this).siblings(".single-number").first();$(this).insertBefore(t),console.log($(this))})}function dragstart(e){draggee=$(e.target)}function dragover(e){e.preventDefault(),e.stopPropagation()}function dragenter(e){e.preventDefault(),e.stopPropagation()}function pendingSortDrop(e){e.preventDefault(),e.stopPropagation();var t=$(this).find(".number-container");t.parent().hasClass("sorter")&&isSorterFilled()&&-1===$("#app").data("currentStep")&&runCurrentTask(),drop(t)}function drop(e){draggee.parent().detach().appendTo(e)}function isPendingEmpty(){return $(".pending .single-number").length<1}function isSorterFilled(){return $(".sorter .single-number").length>=maxSortCount-1}function runCurrentTask(){void 0!==currentTask&&(currentTask(),currentTask=void 0)}function addImagesToPending(e){if(numObjCount<7e4-e){for(var t=0;t<e;t++){var a=numberObjs[numObjCount];$(singleNumberElem).clone().prependTo(".pending .number-container").find("img").attr("src",a.path).data("arrayId",numObjCount),numObjCount++}maxSortCount=numObjCount,0!==oldMax&&remapMagic(oldMax,maxSortCount),oldMax=maxSortCount,$(".augusta-range input").attr("max",maxSortCount),initNumberListeners()}else alert("What??? You went through all 70000 numbers? Daaamn. You should send me a screenshot of this on my Twitter @jepster_dk!")}function resetImages(){shuffle($(".single-number")).appendTo(".pending .number-container")}function updateGuessListeners(){$(".augusta-button .btn").off("click"),$(".augusta-button.step-1 .btn").on("click",function(){$(".pending .single-number").each(function(){var e=getRandom(0,9);$(this).detach().prependTo($(".sorter .number-container")[e])}),isSorterFilled()&&(augustaOffset=0,calculateAugustaOffset(),replaceSectionPhrase(8,/\$\$\$/,augustaOffset),runCurrentTask())}),$(".augusta-button.step-2 .btn").on("click",function(){isPendingEmpty()||(guessMagic=parseInt($(".augusta-range input").val()),trueMagic=guessMagic<5?getRandom(6,11):getRandom(1,5),runMagicGuess(),setTimeout(function(){augustaOffset=0,calculateAugustaOffset(),replaceSectionPhrase(13,/\$\$\$/,augustaOffset);var e=["actually worse than before","as bad as before","perfect! But I think we only got REALLY close to the right weight","better than before"],t="";augustaOffset>augustaOffsetHistory[0]?t=e[0]:augustaOffset===augustaOffsetHistory[0]?t=e[1]:0===augustaOffset?t=e[2]:augustaOffset<augustaOffsetHistory[0]&&(t=e[3]),replaceSectionPhrase(13,/\$asBadAs/,t),runCurrentTask()},500))}),$(".augusta-button.step-3 .btn").on("click",function(){if(!isPendingEmpty()){if(guessMagic=parseInt($(".augusta-range input").val()),runMagicGuess(),augustaOffset=0,calculateAugustaOffset(),0!==augustaOffset&&!haveRemindedOfMagic){var e=["increase","decrease"],t="";t=guessMagic<trueMagic?e[0]:e[1];var a=JSON.parse(JSON.stringify(findMagicNumberConv));a=replaceThisPhrase(a,/\$increase/,t),insertQuestion(a),haveRemindedOfMagic=!0}0===augustaOffset&&setTimeout(function(){replaceSectionPhrase(17,/\$\$\$/,augustaOffset),runCurrentTask()},500)}}),$(".augusta-button.step-4 .btn").on("click",function(){isPendingEmpty()||(guessMagic=parseInt($(".augusta-range input").val()),runMagicGuess(),setTimeout(function(){augustaOffset=0,calculateAugustaOffset();var e=["Oh no, that didn't go well. Now she is off by $$$...","That went reasonably well. She was only off by $$$...","No wrong guesses! That was perfect! However, I think we might have gotten lucky this time."],t="";augustaOffset>5?t=e[0]:augustaOffset>0?t=e[1]:0===augustaOffset&&(t=e[2]),replaceSectionPhrase(19,/\$replacer/,t),replaceSectionPhrase(19,/\$\$/,augustaOffset),runCurrentTask()},500))}),$(".augusta-button.step-6 .btn").on("click",function(){isPendingEmpty()||(guessMagic=parseInt($(".augusta-range input").val()),runMagicGuess(),setTimeout(function(){augustaOffset=0,calculateAugustaOffset();var e=["almost all of them","all of them"],t="";t=0===augustaOffset?e[1]:e[0],replaceSectionPhrase(26,/\$\$\$/,augustaOffset),replaceSectionPhrase(26,/\$almostAll/,t),runCurrentTask()},500))}),$(".augusta-button.step-7 .btn").on("click",function(){isPendingEmpty()||(guessMagic=parseInt($(".augusta-range input").val()),runMagicGuess())})}function isMagicCloseEnough(){return guessMagic=parseInt($(".augusta-range input").val()),Math.abs(trueMagic-guessMagic)<learningRate}function calculateAugustaOffset(){$(".sorter .single-number").each(function(){var e=$(this).find("img").data("arrayId"),t=numberObjs[e],a=parseInt($(this).parent().parent().attr("data-sort-id"));augustaOffset+=Math.abs(parseInt(t.numberId)-a)}),augustaOffsetHistory.push(augustaOffset)}function updateProgress(e,t){var a=parseInt($(".overlay-interface .progress-bar").css("width"));(a=a<100?a+1:100)<100?$(".overlay-interface .progress-bar").width(a+"%"):($(".overlay-interface .progress-bar").width(a+"%"),clearInterval(t),setTimeout(e,1e3))}function setProgress(e){e=e<100?e:100,$(".overlay-interface .progress-bar").width(e+"%")}function runMagicGuess(){shuffle($(".pending .single-number")).each(function(e){var t=$(this).find("img").data("arrayId");makeGuess(numberObjs[t],maxSortCount),moveImgOnGuess(numberObjs[t],$(this))})}function makeGuess(e){var t=Math.abs(guessMagic-trueMagic),a=Math.floor(myRand()*t);a=Math.floor(myP5.map(a,0,maxSortCount-1,0,10));var n=e.numberId+a*(guessMagic>trueMagic?1:-1);e.numberId,e.numberId;n=Math.min(n,9),n=Math.max(0,n),e.networkGuess=n}function moveImgOnGuess(e,t){$(".sorter .number-container").eq(e.networkGuess).append(t)}function remapMagic(e,t){var a=maxSortCount;void 0!==t&&(a=t),1===trueMagic?Math.floor(trueMagic+=a/10):trueMagic===e&&Math.floor(trueMagic-=a/10),trueMagic=Math.ceil(myP5.map(trueMagic,1,e,1,a))}function learnMagicNumber(){runMagicGuess(),guessMagic<trueMagic?guessMagic+=learningRate:guessMagic>trueMagic&&(guessMagic-=learningRate),guessMagic=Math.min(guessMagic,maxSortCount),guessMagic=Math.max(0,guessMagic),$(".augusta-range input").val(guessMagic)}function fetchImgNames(){return new Promise(function(e,t){fetch("/tale/getImgNames").then(function(t){200===t.status?t.json().then(function(t){e(t)}):console.log("Looks like there was a problem. Status Code: "+t.status)}).catch(function(e){t("Fetch Error :-S",e)})})}$(document).ready(function(){fetchImgNames().then(function(e){testImgNameArrays=e[0];for(let e=0;e<testImgNameArrays.length;e++)for(let t of testImgNameArrays[e])numberObjs.push({numberId:e,src:t,path:"/tale/dist/img/test/"+e+"/"+t,playerLabel:-1,networkGuess:-1});trainImgNameArrays=e[1];for(let e=0;e<trainImgNameArrays.length;e++)for(let t of trainImgNameArrays[e])numberObjs.push({numberId:e,src:t,path:"/tale/dist/img/training/"+e+"/"+t,playerLabel:-1,networkGuess:-1});numberObjs=shuffle(numberObjs)}).catch(function(e){console.log("FetchImgNames Error :-S",e)}),$(".full-overlay .btn").click(function(e){$(this).parent().hasClass("hidden")||$(this).parent().fadeOut(300,function(){$(this).addClass("hidden"),$(this).hasClass("intro-overlay-interface")&&startChat()})}),$(".augusta-reset").click(function(){0===$("#app").data("currentStep")&&$("#app").data("currentStep",1),resetImages()}),$(".augusta-learn").click(function(){isPendingEmpty()||$(".btn").hasClass("step-6")||(learningTimer=setInterval(function(){clearTimeout(learningTimerKillswitch),$("#app").hasClass("is-learning")||($("#app").addClass("is-learning"),$("#augusta-range").prop("disabled",!0),$(".btn").css("pointer-events","none").addClass("disabled"),$(".augusta-learn i").addClass("fa-spin")),isMagicCloseEnough()||(resetImages(),learnMagicNumber()),isMagicCloseEnough()&&(clearInterval(learningTimer),learningTimerKillswitch=setTimeout(function(){augustaOffset=0,calculateAugustaOffset(),$("#app").removeClass("is-learning"),$("#augusta-range").prop("disabled",!1),$(".btn").css("pointer-events","auto").removeClass("disabled"),$(".augusta-learn i").removeClass("fa-spin"),runCurrentTask()},500))},500))}),setInterval(updateGUI,50)});
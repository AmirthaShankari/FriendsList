var friendList = (function () {
  var pagination,
    friendListData,
    paginationResponse,
    localStorageData,
    currentFocus;
  //BEGIN :: function to fetch the friend list data
  var fetchFriendlistData = function () {
    $.ajax({
      url: "https://run.mocky.io/v3/6e416596-0aac-4a93-ad60-fbfb71d7b78d",
      method: "GET",
      dataType: "json",
      timeout: 5000,
      success: function (data) {
        consoleUtility.log("Ajax request to fetch data success");
        renderFriendsListDetail(data);
      },
      fail: function (err) {
        consoleUtility.log("Ajax failure : ", err);
      },
      error: function (err) {
        consoleUtility.log("Ajax Error : " + JSON.stringify(err));
      },
    });
  };
  //END :: function to fetch the friend list data

  //BEGIN :: Build alphabetical filter DOM
  var buildAlphabeticalFilterDom = function () {
    var documentFragment = document.createDocumentFragment(),
      alphaFilterContainerElement = $("#alphabetical-search");
    for (let i = 0; i < FRIEND_LIST_CONST.ALPHABETS.length; i++) {
      let alphaElement = document.createElement("div");
      alphaElement.innerText = FRIEND_LIST_CONST.ALPHABETS[i];
      documentFragment.appendChild(alphaElement);
    }
    var clearElement = document.createElement("div");
    clearElement.innerHTML = '<i class="far fa-times-circle"></i>';
    documentFragment.appendChild(clearElement);
    alphaFilterContainerElement[0].appendChild(documentFragment);
  };
  //END :: Build alphabetical filter DOM

  //BEGIN :: Function to mark active alphabetical filter
  var markActiveAlphabeticalFilter = function (alphabeticalFilterVal) {
    var alphabeticalFilterElements = $("#alphabetical-search div");
    for (let i = 0; i < alphabeticalFilterElements.length; i++) {
      if (alphabeticalFilterElements[i].innerText === alphabeticalFilterVal) {
        alphabeticalFilterElements[i].setAttribute(
          "class",
          "alphabetical-filter-active"
        );
        break;
      }
    }
  };
  //END :: Function to mark active alphabetical filter

  //BEGIN :: function to check the availability of localstorage item
  var checkAvailabilityOfLocalStorage = function () {
    if (!localStorage.hasOwnProperty("friendsList")) {
      localStorage.setItem("friendsList", JSON.stringify([]));
    }
  };
  //END :: function to check the availability of localstorage item

  //BEGIN :: function to fetch friendlist favourite detail
  var fetchFriendListFavouriteDetail = function () {
    //Check if localstorage is available
    checkAvailabilityOfLocalStorage();
    consoleUtility.log("Entering fetchFriendListFavouriteDetail");
    localStorageData = localStorage.getItem("friendsList");
    localStorageData = JSON.parse(localStorageData);
    consoleUtility.log(
      "Exiting fetchFriendListFavouriteDetail, local storage data : " +
        JSON.stringify(localStorageData)
    );
  };
  //END :: function to fetch friendlist favourite detail

  //BEGIN :: function to update friendlist favourites detail
  var updateFriendListFavouriteDetail = function (id, favFlag) {
    consoleUtility.log(
      "Entering updateFriendListFavouriteDetail, id : " +
        id +
        " favFlag : " +
        favFlag
    );
    var favouritesObj = {};
    if (favFlag === "yes") {
      for (let i = 0; i < localStorageData.length; i++) {
        if (id == localStorageData[i]["id"]) {
          localStorageData.splice(i, 1);
          break;
        }
      }
      pagination.updateData(id, "no", "favourite");
    } else {
      favouritesObj.id = id;
      favouritesObj.favourite = "yes";
      localStorageData.push(JSON.parse(JSON.stringify(favouritesObj)));
      pagination.updateData(id, "yes", "favourite");
    }
    localStorage.setItem("friendsList", JSON.stringify(localStorageData));
    consoleUtility.log(
      "Exiting updateFriendListFavouriteDetail, friendFavListDetail " +
        JSON.stringify(localStorageData)
    );
  };
  //BEGIN :: function to update friendlist favourites detail

  //BEGIN :: process the json data to the required format
  var formatJsonData = function (inputJsonData) {
    var name, favourite;
    consoleUtility.log(
      "Entering formatJsonData : " + JSON.stringify(inputJsonData)
    );
    for (let i = 0; i < inputJsonData.length; i++) {
      (name = ""), (favourite = "no");
      if (
        inputJsonData[i]["first_name"] !== "" ||
        inputJsonData[i]["last_name"] !== ""
      ) {
        name =
          inputJsonData[i]["first_name"] + " " + inputJsonData[i]["last_name"];
      }
      for (let j = 0; j < localStorageData.length; j++) {
        if (inputJsonData[i]["id"] == localStorageData[j]["id"]) {
          favourite = "yes";
        }
      }
      inputJsonData[i].name = name;
      inputJsonData[i].favourite = favourite;
    }
    consoleUtility.log(
      "Exiting formatJsonData : " + JSON.stringify(inputJsonData)
    );
    return inputJsonData;
  };
  //END :: process the json data to the required format

  //BEGIN :: function to remove search autocomplete
  var removeSearchAutoComplete = function () {
    $(".autocomplete-items").remove();
    currentFocus = -1;
  };
  //END :: function to remove search autocomplete

  //BEGIN :: populate search box with auto complete data
  var populateSearchAutoComplete = function (autoCompleteData) {
    consoleUtility.log("autocomplete");
    consoleUtility.log(autoCompleteData);
    removeSearchAutoComplete();
    var documentFragment = document.createDocumentFragment();
    if (autoCompleteData.length > 0) {
      let autoCompleteElement = document.createElement("div");
      if (autoCompleteData.length >= 7) {
        autoCompleteElement.setAttribute(
          "class",
          "autocomplete-items autocomplete-item-height"
        );
      } else {
        autoCompleteElement.setAttribute("class", "autocomplete-items");
      }
      documentFragment.appendChild(autoCompleteElement);
      for (let i = 0; i < autoCompleteData.length; i++) {
        let autoCompleteItem = document.createElement("div");
        autoCompleteItem.innerText = autoCompleteData[i];
        autoCompleteElement.appendChild(autoCompleteItem);
      }
      $(".autocomplete")[0].appendChild(documentFragment);
    }
  };
  //END :: Populate search box with auto complete data

  //BEGIN :: Function to build friendlist DOM
  var buildFriendListDOM = function (inputJsonData) {
    consoleUtility.log(
      "Entering buildFriendListDOM input params : " +
        JSON.stringify(inputJsonData)
    );
    $(".loader-wrapper").addClass("display-block");
    var documentFragment = document.createDocumentFragment();
    var friendlistElement = $(".friend-list-detail");

    //BEGIN :: Remove the existing content
    $(".friend-list-detail").empty();
    //END :: Remove the existing content

    if (inputJsonData.length > 0) {
      for (let i = 0; i < inputJsonData.length; i++) {
        //BEGIN :: Creating friend detail element
        let friendDetail = document.createElement("div");
        friendDetail.setAttribute("class", "friend-detail");
        friendDetail.setAttribute("data-id", inputJsonData[i]["id"]);
        //END :: Creating friend detail element

        //BEGIN :: Creating Image container
        let imageContainerElement = document.createElement("div");
        imageContainerElement.setAttribute("class", "image-container");
        let imageElement = document.createElement("img");
        imageElement.setAttribute("src", inputJsonData[i]["img"]);
        if (inputJsonData[i]["gender"] === "men") {
          imageElement.setAttribute(
            "onError",
            "this.src = 'images/defaultMenProfilePic.jpg';"
          );
        } else {
          imageElement.setAttribute(
            "onError",
            "this.src = 'images/defaultWomenProfilePic.jpg';"
          );
        }
        imageContainerElement.appendChild(imageElement);
        //END :: Creating Image container

        //BEGIN :: Creating detail container
        let detailContainerElement = document.createElement("div");
        detailContainerElement.setAttribute("class", "detail-container");
        //BEGIN :: Name and Favourite container
        let nameFavContainerElement = document.createElement("div");
        nameFavContainerElement.setAttribute(
          "class",
          "name-favourite-container"
        );
        let nameElement = document.createElement("div");
        nameElement.setAttribute("class", "name");
        nameElement.innerText = inputJsonData[i]["name"];
        let favouritesElement = document.createElement("div");
        favouritesElement.setAttribute("class", "favourite");
        let favouriteFavIconElement = document.createElement("div");
        if (inputJsonData[i]["favourite"] === "yes") {
          favouriteFavIconElement.setAttribute("class", "fas fa-star");
          favouriteFavIconElement.setAttribute("data-fav", "yes");
        } else {
          favouriteFavIconElement.setAttribute("class", "far fa-star");
          favouriteFavIconElement.setAttribute("data-fav", "no");
        }
        favouritesElement.appendChild(favouriteFavIconElement);
        nameFavContainerElement.appendChild(nameElement);
        nameFavContainerElement.appendChild(favouritesElement);
        //END :: Name and Favourite container
        //BEGIN :: Email and Gender container
        let emailGenderContainerElement = document.createElement("div");
        emailGenderContainerElement.setAttribute(
          "class",
          "email-gender-wrapper"
        );
        let genderElement = document.createElement("div");
        genderElement.setAttribute("class", "gender");
        let genderIcon = document.createElement("i");
        if (inputJsonData[i]["gender"] === "men") {
          genderIcon.setAttribute("class", "fas fa-male");
        } else {
          genderIcon.setAttribute("class", "fas fa-female");
        }
        genderElement.appendChild(genderIcon);
        let emailElement = document.createElement("div");
        emailElement.setAttribute("class", "email");
        let emailAnchorElement = document.createElement("a");
        emailAnchorElement.setAttribute(
          "href",
          "mailto:" + inputJsonData[i]["email"]
        );
        emailAnchorElement.setAttribute("class", "email-link");
        emailAnchorElement.innerText = inputJsonData[i]["email"];
        emailElement.appendChild(emailAnchorElement);
        emailGenderContainerElement.appendChild(genderElement);
        emailGenderContainerElement.appendChild(emailElement);
        //END :: Email and Gender container
        detailContainerElement.appendChild(nameFavContainerElement);
        detailContainerElement.appendChild(emailGenderContainerElement);
        //END :: Creating detail container

        friendDetail.appendChild(imageContainerElement);
        friendDetail.appendChild(detailContainerElement);

        //BEGIN Append the elements to documentFragment
        documentFragment.appendChild(friendDetail);
        //END Append the elements to documentFragment
      }
    } else {
      //BEGIN :: Handling empty result
      let messageElement = document.createElement("div");
      messageElement.innerText = FRIEND_LIST_CONST.NO_SEARCH_RESULT;
      messageElement.setAttribute("class", "message");
      documentFragment.appendChild(messageElement);
      //END :: Handling empty result
    }
    //BEGIN :: Remove Loader
    $(".loader-wrapper").removeClass("display-block");
    $(".loader-wrapper").addClass("display-none");
    //END :: Remove Loader
    //Adding the friends to friends-list
    friendlistElement[0].appendChild(documentFragment);
    consoleUtility.log("Exiting buildFriendListDOM");
  };
  //END :: Function to build friendlist DOM

  //BEGIN :: Function to build the pagination section
  var buildPaginationDOM = function (
    currentPage,
    totalPages,
    dataLength,
    totalRecords
  ) {
    consoleUtility.log(
      "Entering Building pagination DOM, input params : currentPage : " +
        currentPage +
        " totalPages : " +
        totalPages +
        " data Length : " +
        dataLength
    );
    var documentFragment = document.createDocumentFragment();
    var paginationContainerElement = $(".pages");

    //BEGIN :: Remove the existing content
    $(".pages").empty();
    $(".result-detail").empty();
    //END :: Remove the existing content

    if (dataLength > 0) {
      //BEGIN :: result detail element
      let resultDetailElement = $(".result-detail")[0];
      resultDetailElement.innerText =
        "Showing " + dataLength + " of " + totalRecords + " friends";
      //END :: result detail element
      //BEGIN :: Previous page arrow element
      let previousArrowElement = document.createElement("button");
      previousArrowElement.setAttribute("class", "page-detail");
      previousArrowElement.innerText = "<";
      previousArrowElement.setAttribute("disabled", true);
      //END :: Previous page arrow element
      //BEGIN :: Next page arrow element
      let nextArrowElement = document.createElement("button");
      nextArrowElement.setAttribute("class", "page-detail");
      nextArrowElement.innerText = ">";
      nextArrowElement.setAttribute("disabled", true);
      //END :: Next page arrow element
      //BEGIN :: Build previous page navigation
      if (currentPage > 1) {
        let previousPgElement, previousElipsesElement, firstPgElement;
        //BEGIN :: Previous page and arrow enable
        if (currentPage - 1 >= 1) {
          previousArrowElement.removeAttribute("disabled");
          previousPgElement = document.createElement("button");
          previousPgElement.setAttribute("class", "page-detail");
          previousPgElement.innerText = currentPage - 1;
          documentFragment.appendChild(previousArrowElement);
          documentFragment.appendChild(previousPgElement);
        }
        //END :: Previous page and arrow enable
        //BEGIN :: Previous page elipses and first page
        if (currentPage - 2 > 1) {
          previousElipsesElement = document.createElement("button");
          previousElipsesElement.setAttribute("class", "page-detail");
          previousElipsesElement.setAttribute("disabled", true);
          previousElipsesElement.innerText = "...";
          previousArrowElement.after(previousElipsesElement);
          firstPgElement = document.createElement("button");
          firstPgElement.setAttribute("class", "page-detail");
          firstPgElement.innerText = 1;
          previousArrowElement.after(firstPgElement);
        }
        //END :: Previous page elipses and first page
      }
      //END :: Build previous page navigation
      //BEGIN :: current page
      let currentPgElement = document.createElement("button");
      currentPgElement.setAttribute("class", "page-detail");
      currentPgElement.classList.add("page-detail-active");
      currentPgElement.innerText = currentPage;
      documentFragment.appendChild(currentPgElement);
      //BEGIN :: current page
      //BEGIN :: Build Next page navigation
      if (currentPage < totalPages) {
        let nextElipsesElement, nextPgElement, lastPgElement;
        //BEGIN :: Next page and next arrow enable
        if (currentPage + 1 <= totalPages) {
          nextArrowElement.removeAttribute("disabled");
          nextPgElement = document.createElement("button");
          nextPgElement.setAttribute("class", "page-detail");
          nextPgElement.innerText = currentPage + 1;
          documentFragment.appendChild(nextPgElement);
          documentFragment.appendChild(nextArrowElement);
        }
        //END :: Next page and next arrow enable
        //BEGIN :: Next page elipses and last page
        if (currentPage + 2 < totalPages) {
          nextElipsesElement = document.createElement("button");
          nextElipsesElement.setAttribute("class", "page-detail");
          nextElipsesElement.setAttribute("disabled", true);
          nextElipsesElement.innerText = "...";
          nextArrowElement.before(nextElipsesElement);
          lastPgElement = document.createElement("button");
          lastPgElement.setAttribute("class", "page-detail");
          lastPgElement.innerText = totalPages;
          nextArrowElement.before(lastPgElement);
        }
        //END :: Next page elipses and last page
      }
      //END :: Build Next page navigation
      paginationContainerElement[0].appendChild(documentFragment);
    }
    consoleUtility.log("Exiting Building pagination DOM");
  };
  //END :: Function to build the pagination section

  //BEGIN :: Render friendList details
  var renderFriendsListDetail = function (responseData) {
    consoleUtility.log(
      "Entering renderFriendsListDetail, Input response data : " +
        JSON.stringify(responseData)
    );
    //Formatting the Ajax response
    fetchFriendListFavouriteDetail();
    formattedData = formatJsonData(responseData);
    friendListData = JSON.parse(JSON.stringify(formattedData));
    //Initializing Pagination for friendlist
    pagination = new Pagination(
      formattedData,
      50,
      ["name"],
      ["#nameSort"],
      ["name", "favourite"],
      ["#searchFriends", "#favouritesFilter"],
      true,
      "name"
    );
    paginationResponse = JSON.parse(JSON.stringify(pagination.renderPage(1)));
    buildAlphabeticalFilterDom();
    //Render friendlist details in DOM
    buildFriendListDOM(paginationResponse.data);
    //Render pagination details in DOM
    buildPaginationDOM(
      Number(paginationResponse.currentPage),
      Number(paginationResponse.totalPageCount),
      paginationResponse.data.length,
      paginationResponse.dataLength
    );
    //Attaching event listeners to DOM elements
    attachEventListeners();
    consoleUtility.log("Exiting renderFriendsListDetail");
  };
  //END :: Render friendlist details

  //BEGIN :: function to refresh DOM data
  var refreshDomData = function () {
    paginationResponse = JSON.parse(JSON.stringify(pagination.renderPage(1)));
    consoleUtility.log(
      "Pagination response : " + JSON.stringify(paginationResponse)
    );
    populateSearchAutoComplete(
      paginationResponse.autoCompleteResult[0].slice()
    );
    buildFriendListDOM(paginationResponse.data);
    consoleUtility.log("search response : ");
    consoleUtility.log(paginationResponse.data);
    if (paginationResponse.alphabeticalFilter !== "") {
      markActiveAlphabeticalFilter(paginationResponse.alphabeticalFilter);
    }
    buildPaginationDOM(
      Number(paginationResponse.currentPage),
      Number(paginationResponse.totalPageCount),
      paginationResponse.data.length,
      paginationResponse.dataLength
    );
  };
  //END :: function to refresh DOM data

  //BEGIN :: attach event listeners
  var attachEventListeners = function () {
    consoleUtility.log("Entering attachEventListeners");
    //BEGIN :: Page click listener
    $(".pagination-bar-container").on("click", ".page-detail", function (
      event
    ) {
      consoleUtility.log("Page click event listener triggered");
      if (this.innerText !== "...") {
        if (this.innerText === "<") {
          paginationResponse = JSON.parse(
            JSON.stringify(pagination.previousPage())
          );
        } else if (this.innerText === ">") {
          paginationResponse = JSON.parse(
            JSON.stringify(pagination.nextPage())
          );
        } else {
          paginationResponse = JSON.parse(
            JSON.stringify(pagination.renderPage(Number(this.innerText)))
          );
        }
        consoleUtility.log(
          "Pagination response : " + JSON.stringify(paginationResponse)
        );
        buildFriendListDOM(paginationResponse.data);
        buildPaginationDOM(
          Number(paginationResponse.currentPage),
          Number(paginationResponse.totalPageCount),
          paginationResponse.data.length,
          paginationResponse.dataLength
        );
      }
    });
    //END :: Page click listener

    //BEGIN :: Prevent search form submit
    $("#searchForm").submit(function (e) {
      return false;
    });
    //END :: Prevent search form submit

    //BEGIN :: Search friends search box listener
    $("#searchFriends").keydown(function (event) {
      if (
        (event.keyCode >= 65 && event.keyCode <= 90) ||
        (event.keyCode >= 97 && event.keyCode <= 122) ||
        event.keyCode == 13 ||
        event.keyCode == 32 ||
        event.keyCode == 8
      ) {
        //Allowing only alphabets to be keyed in
        return true;
      } else {
        //Preventing numbers and spl char input
        return false;
      }
    });

    $("#searchFriends").keyup(function (event) {
      //Up/Down arrow key listeners for auto complete
      var searchNameAutoComplete = $(".autocomplete-items");
      consoleUtility.log(
        "Key press detected from autocomplete currentfocus" + currentFocus
      );
      if (searchNameAutoComplete) {
        searchNameAutoComplete = $(".autocomplete-items div");
        consoleUtility.log(
          "elementslist" + JSON.stringify(searchNameAutoComplete)
        );
        if (event.keyCode == 40) {
          currentFocus++;
          addActive(searchNameAutoComplete);
        } else if (event.keyCode == 38) {
          currentFocus--;
          addActive(searchNameAutoComplete);
        } else if (event.keyCode == 13) {
          event.preventDefault();
          if (currentFocus > -1) {
            if (searchNameAutoComplete) {
              searchNameAutoComplete[currentFocus].click();
            }
          }
        } else {
          //Rerender the DOM based on search criteria
          refreshDomData();
        }
      }
      function addActive(element) {
        if (!element) return false;
        removeActive(element);
        if (currentFocus >= element.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = element.length - 1;
        element[currentFocus].classList.add("autocomplete-active");
        let childPosition = element[currentFocus];
        if (currentFocus % 7 === 0) {
          $(".autocomplete-items").scrollTop(childPosition.offsetTop);
        }
      }
      function removeActive(element) {
        for (let i = 0; i < element.length; i++) {
          element[i].classList.remove("autocomplete-active");
          element[i].removeAttribute("tabindex");
        }
      }
      //Up/Down arrow key listeners for auto complete
    });
    //END :: Search friends search box listener

    //BEGIN :: favourites dropdown listener
    $("#favouritesFilter").change(function (event) {
      refreshDomData();
      removeSearchAutoComplete();
    });
    //END :: favourites dropdown listener

    //BEGIN :: name sort listener
    $("#nameSort").click(function (event) {
      if ($(this).attr("sort") === "desc") {
        $(this).attr("sort", "asc");
      } else {
        $(this).attr("sort", "desc");
      }
      $("#nameSort").toggleClass("fa-sort-amount-up fa-sort-amount-down");
      refreshDomData();
    });
    //END :: name sort listener

    //BEGIN :: favourite click listener
    $(".friend-list-detail").on("click", ".favourite div", function (event) {
      event.stopPropagation();
      $(this).toggleClass("far fas");
      var id = $(this).parent().parent().parent().parent().attr("data-id");
      updateFriendListFavouriteDetail(id, $(this).attr("data-fav"));
    });
    //END :: favourite click listener

    //BEGIN :: email click listener to prevent event bubbling
    $(".friend-list-detail").on("click", ".email", function (event) {
      event.stopPropagation();
    });
    //END :: email click listener to prevent event bubbling

    //BEGIN :: friend click listener
    $(".friend-list-detail").on("click", ".friend-detail", function (event) {
      consoleUtility.log("Click detected");
      let friendId, responseData;
      responseData = paginationResponse.data;
      consoleUtility.log(responseData);
      friendId = $(this).attr("data-id");
      for (let i = 0; i < responseData.length; i++) {
        if (responseData[i]["id"] == friendId) {
          $(".friend-description .name").empty();
          $(".friend-description .description").empty();
          $(".friend-description .name").text(responseData[i]["name"]);
          $(".friend-description .description").text(
            responseData[i]["description"]
          );
        }
      }
      $(".pop-up-wrapper").fadeIn(400);
      $(".friend-description").fadeIn(400);
    });
    //END :: friend click listener

    //BEGIN :: autocomplete click to add the value to search box
    $(".autocomplete").on("click", ".autocomplete-items div", function (event) {
      $("#searchFriends").val(this.innerText);
      refreshDomData();
    });
    //END :: autocomplete click to add the value to search box

    //BEGIN :: alphabetical filter for name
    $("#alphabetical-search").on("click", "div", function (event) {
      consoleUtility.log("alphabetical click detected");
      var alphabeticalFilterElements = $("#alphabetical-search div");
      for (let i = 0; i < alphabeticalFilterElements.length; i++) {
        //if($(this).hasAttribute("class")){
        alphabeticalFilterElements[i].removeAttribute("class");
        //}
      }
      pagination.updateAlphabetFilter(this.innerText);
      refreshDomData();
    });
    //END :: alphabetical filter for name

    //BEGIN :: friend detail pop up close click listener
    $(".friend-description i").click(function (event) {
      $(".pop-up-wrapper").fadeOut(400);
      $(".friend-description").fadeOut(400);
    });

    //BEGIN :: pressing esc to close the pop up listener
    $(document).keydown(function (event) {
      if (event.keyCode === 27) {
        $(".pop-up-wrapper").fadeOut(400);
        $(".friend-description").fadeOut(400);
      }
    });
    //END :: pressing esc to close the pop up listener
    //END :: friend detail pop up close click listener
    $(document).click(function (event) {
      removeSearchAutoComplete();
    });

    consoleUtility.log("Exiting attachEventListeners");
  };
  //END :: attach event listeners

  return {
    fetchFriendlistData: fetchFriendlistData,
  };
})();

$(document).ready(function () {
  //Fetch the friend list data
  var dat = friendList.fetchFriendlistData();
});

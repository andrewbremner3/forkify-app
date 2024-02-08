import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    // 1)render spinner for slow loading
    recipeView.renderSpinner();

    //1.5 update resutls view to mark selected search
    resultsView.update(model.getSearchResultsPage());
    // update bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 2) load recipe
    await model.loadRecipe(id); // promise

    // 3) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // resultsView.renderSpinner();
    // 1) get search query from search view
    const query = searchView.getQuery();
    if (!query) return;
    // move spinner here for an empty search to not start the spinner
    resultsView.renderSpinner();
    // 2) load the searched query results
    await model.loadSearchResults(query);

    // 3)Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    // 4) Render inital pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {}
};

// Control the Pagination
const controlPagination = function (goToPage) {
  // 1)Render NEW Results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1) update the recipe servings (in state)
  model.updateServings(newServings);
  // 2) update the recipe view
  // recipeView.render(model.state.recipe); // dont re-render the entire page
  recipeView.update(model.state.recipe);
};

// Bookmark controller
const controlAddBookmark = function () {
  // 1) add toggle on and off of bookmarking
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();
    // upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render data
    recipeView.render(model.state.recipe);
    //success message
    addRecipeView.renderMessage();
    // render mookmarks
    bookmarksView.render(model.state.bookmarks);
    // change IF in UrL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close the modal from window
    setTimeout(function () {
      addRecipeView.toggleWindow();
      // location.reload(); // cheap trick to fix issues
      setTimeout(() => addRecipeView.resetForm(), MODAL_CLOSE_SEC * 200);
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
  // console.log(newRecipe);
};

const newFeature = function () {
  console.log('Welcome to application!');
};
// publisher subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();

//
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);

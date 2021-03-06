import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import firebase from 'firebase'
import router from '../router'
import VuexPersist from 'vuex-persist'
import * as Cookies from 'js-cookie'


Vue.use(Vuex);

let baseData = {
  dependencies : [
    'BootstrapVue',
    'VueRouter',
    'Vuex',
    'Sass/Scss',
    'Axios',
    'Firebase'
  ]
 }


 const vuexLocalStorage = new VuexPersist({
   key: 'vuex', // The key to store the state on in the storage provider.
   storage: window.localStorage, // or window.sessionStorage or localForage
   // Function that passes the state and returns the state with only the objects you want to store.
   // reducer: state => state,
   // Function that passes a mutation and lets you decide if it should update the state in localStorage.
   // filter: mutation => (true)
 })


export const store = new Vuex.Store({

    state : {
      dependencies : { ...baseData.dependencies } ,
      routes : [ ...router.options.routes ],
      user : {},
      todo : []
    },
    //This is where you define the data structure of your application.
    //You can also set default or initial state here.

    actions : {
        getCalculatedTotalCashout: ({ commit, state}, payload) => {
            console.log(payload);
            commit('setCalculatedTotalCashout', payload);
        },

        loadCarList: ( { commit } ) => {
            axios.get('api/data').then(response => {
                commit('setCarList', { list: response.data })
            });
        },

        logOut: ( { commit }) => {
          firebase.auth().signOut().then( () => {
            alert('Logged out')
            router.push('login')
          })

          commit('clearUser', {})
        },

        getFirebaseUser : ( {commit, state}, payload) => {
            console.log("getFirebaseUser: ", payload);

            const user  = {
              name : payload.displayName,
              email : payload.email,
              photoUrl : payload.photoURL,
              emailVerified : payload.emailVerified,
              uid : payload.uid
            }

            commit('setFirebaseUser', user);
        },

        getTodo : ( { commit } ) => {
          const app = firebase.app()
          const db = firebase.firestore()
          let todoList = []

          const todo = db.collection('todo')
          .get()
          .then(querySnapshot => {
              querySnapshot.forEach( doc  => {
                  console.log( doc.id, " => ", doc.data() )
                  todoList.push( doc.data() )
              })
          })
          commit('setTodo', todoList)
        },

        addTodo : ( { commit }, payload ) => {
          const app = firebase.app()
          const db = firebase.firestore()

          db.collection('todo')
          .add( payload )
          .then( docRef => {
            alert("Document Written with ID: ", docRef.id )
          }).catch( err => {
            alert("Error adding Document: ", err )
          })

        },

    },
    //Actions are where you define the calls that will commit
    //changes to your store. A common example of this would be a
    //call to an api to retrieve data, once it completes you call store.commit()
    //to invoke a mutation to actually update the data in the store.
    //Actions are called in your components via dispatch call.

    mutations : {
        setCalculatedTotalCashout: (state, list) => {
            console.log(list);
            state.summary.totalCashout = list;
        },
        setCarList : ( state, { list }) => {
            state.carList = list.filter((item) => {
                return item.brand !== '18' && item.brand !== '23' && item.brand !== '2018'
            });
            const brand = Object.keys( state.carList );
            state.brandList = Object.keys( groupBy(state.carList, 'brand' ) );
        },
        setFirebaseUser : (state, list) => {
            state.user = list;
        },

        clearUser : (state, list) => {
            state.user = list;
        },

        setTodo : ( state, list ) => {
          state.todo = list
        }

    },
    //The mutations calls are the only place that the store can be updated.

    getters : {
      authRoutes : state => {
        const list = state.routes.filter( x => x.meta.requiresAuth == true )
        return list
      },

      publicRoutes : state => {
        const list = state.routes.filter( x => x.meta.requiresAuth == false )
        return list
      }

    },
    //Getters are a way to grab computed data from the store. For example,
    // if you have a project list, one component might only want to show projects
    //that are completed:

    modules: {

    },

    plugins: [
     vuexLocalStorage.plugin
   ]

});

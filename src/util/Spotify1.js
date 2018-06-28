//import React from 'react';
//import './SearchBar.css';
const clientID = '5bab9b453da744ccb80b7909faf2e392';
const redirectURI = 'http://localhost:3000/';

let accessToken = '';
const Spotify = {
  getAccessToken() {
    if (accessToken !== '') {
      return accessToken;
    } else {
      const accessTokenArray = window.location.href.match(/access_token=([^&]*)/);
      const expiresInArray = window.location.href.match(/expires_in=([^&]*)/);

      if (accessTokenArray && expiresInArray) {
        accessToken = accessTokenArray[1];
        const expiresIn = Number(expiresInArray[1]);

        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return accessToken;
      } else {
        const redirect = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
        window.location = redirect;
      }
    }
  },

  search(term) {
    let currentUser = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {Authorization: `Bearer ${currentUser}`}
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        })
      );
    })
  },

  savePlaylist(playlistName, trackURIs) {
    if (!playlistName && !trackURIs) {
      return;
    } else {
      let currentUser = Spotify.getAccessToken();
      let headers = {Authorization: `Bearer ${currentUser}`};
      //let userID = '';
      return fetch('https://api.spotify.com/v1/me', {
        headers: headers
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        let userID = jsonResponse.id;
      }).then(userID => {
        fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({name: `${playlistName}`})
        }).then(response => {
          return response.json();
        }).then(jsonResponse => {
          let playlistID = jsonResponse.id;
          fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({uris: `${trackURIs}`}),
          })
        })
      })
    }
  }
}

export default Spotify;

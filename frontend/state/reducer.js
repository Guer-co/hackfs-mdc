function dappReducer(state = {}, action) {
  //console.log('dappReducer', state, action);
  let newState = {};
  switch (action.type) {
    case 'SET_ADDRESS':
      newState.address = action.payload;
      return { ...state, ...newState };
    case 'SET_NETWORK':
      newState.network = action.payload;
      return { ...state, ...newState };
    case 'SET_BALANCE':
      newState.balance = action.payload;
      return { ...state, ...newState };
    case 'SET_WEB3':
      newState.web3 = action.payload;
      return { ...state, ...newState };
    case 'SET_CURRENTLY_MINING':
      newState.currentlyMining = action.payload;
      return { ...state, ...newState }
    case 'CLEAR_ACCOUNT':
      newState.address = undefined;
      newState.balance = undefined;
      return { ...state, ...newState };
    default:
      return state;
  }
}

export default function mainReducer({ dapp }, action) {
  // middleware goes here, i.e calling analytics service, etc.
  return {
    dapp: dappReducer(dapp, action)
  };
}

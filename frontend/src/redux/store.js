import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slide/counterSlide'
export const store = configureStore({
  reducer: {
    counter: counterReducer
  },
})

export default store

// import { createContext, useState } from "react";

// export const AppContext = createContext()

// const AppContextProvider = (props) => {

//     const [userData, setUserData] = useState(null)
//     const [chatData, setChatData] = useState(null)

//     const loadUserData = (uid) => {
//         try {
//             // Load from backend
//         } catch (e) {

//         }
//     }

//     const value = {
//         userData, setUserData,
//         chatData, setChatData,
//         loadUserData
//     }
//     return (
//         <AppContext.Provider value={value}>
//             {props.children}
//         </ AppContext.Provider>
//     )
// }

// export default AppContextProvider
// store.js
import { create } from 'zustand';

const useStore = create((set) => ({
    selectedChat: null,
    setSelectedChat: (chatId) => set({ selectedChat: chatId }),
    chatList: [],
    setChatList: (newChatList) => set({ chatList: newChatList }),

    loginUser: null,
    setLoginUser: (userInfo) => set({ loginUser: userInfo }),

    friends: [],
    setFriends: (newFriends) => set({ friends: newFriends }),

    groups: [],
    setGroups: (newGroups) => set({ groups: newGroups }),

    friendRequestsSent: [],
    setFriendRequestsSent: (newReq) =>
        set({ friendRequestsSent: newReq }),

    friendRequestsReceived: [],
    setFriendRequestsReceived: (newReq) =>
        set({ friendRequestsReceived: newReq }),
}));

export default useStore;

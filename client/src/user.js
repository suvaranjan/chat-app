export const user = {
    _id: 'user_id_1',
    name: 'Test User',
    email: 'testuser@example.com',
    avatar: 'https://bit.ly/dan-abramov',
    password: 'password123',
    friends: [
        {
            friend: {
                _id: 'friend_id_1',
                name: 'Test-2',
                email: 'test2@example.com',
                avatar: 'https://bit.ly/kent-c-dodds',
                status: {
                    _id: 'status_id_1',
                    status: 'online',
                    lastSeen: '2024-01-08T12:30:00Z',
                },
            },
            chat: {
                _id: 'your_chat_id',
                participants: [
                    {
                        _id: 'user_id_1',
                        name: 'Test User',
                        email: 'testuser@example.com',
                        avatar: 'https://bit.ly/dan-abramov',
                    },
                    {
                        _id: 'friend_id_1',
                        name: 'Test-2',
                        email: 'test2@example.com',
                        avatar: 'https://bit.ly/kent-c-dodds',
                    },
                ],
                type: 'single',
                messages: [
                    {
                        _id: 'message1_id',
                        content: 'Hello, Jane!',
                        sender: {
                            _id: 'user_id_1',
                            name: 'Test User',
                            email: 'testuser@example.com',
                            avatar: 'https://bit.ly/dan-abramov',
                        },
                        timeStamp: '2024-01-11T04:10:53.954+00:00',
                        seenBy: [],
                    },
                    {
                        _id: 'message1_id',
                        content: 'call me',
                        sender: {
                            _id: 'user_id_1',
                            name: 'Test User',
                            email: 'testuser@example.com',
                            avatar: 'https://bit.ly/dan-abramov',
                        },
                        timeStamp: '2024-01-11T04:10:53.954+00:00',
                        seenBy: [],
                    },
                    {
                        _id: 'message2_id',
                        content: 'Hi John! How are you?',
                        sender: {
                            _id: 'friend_id_1',
                            name: 'Test-2',
                            email: 'test2@example.com',
                            avatar: 'https://bit.ly/kent-c-dodds',
                        },
                        timeStamp: '2025-01-07T12:30:00Z',
                        seenBy: [],
                    },
                    {
                        _id: 'message2_id',
                        content: 'all good',
                        sender: {
                            _id: 'friend_id_1',
                            name: 'Test-2',
                            email: 'test2@example.com',
                            avatar: 'https://bit.ly/kent-c-dodds',
                        },
                        timeStamp: '2025-01-07T12:30:00Z',
                        seenBy: [],
                    },
                ],
                latestMessage: {
                    _id: 'message2_id',
                    content: 'Hi John! How are you?',
                    sender: {
                        _id: 'friend_id_1',
                        name: 'Test-2',
                        email: 'test2@example.com',
                        avatar: 'https://bit.ly/kent-c-dodds',
                    },
                    timeStamp: '2025-01-07T12:30:00Z',
                    seenBy: [],
                },
                createdAt: '20118-01-07T12:30:00Z',
                updatedAt: '2025-01-07T12:30:00Z',
            },
        },
    ],
    groups: [
        {
            group: {
                _id: 'group_id_1',
                name: 'New Group',
                avatar: 'https://bit.ly/broken-link',
                admin: {
                    _id: 'user_id_1',
                    name: 'Test User',
                    email: 'testuser@example.com',
                    avatar: 'https://bit.ly/dan-abramov',
                },
                members: [
                    {
                        _id: 'user_id_1',
                        email: 'testuser@example.com',
                        name: 'Test User',
                        avatar: 'https://bit.ly/dan-abramov',
                        status: {
                            _id: 'status_id_member_1',
                            status: 'offline',
                            lastSeen: '2024-01-08T12:30:00Z',
                        },
                    },
                    {
                        _id: 'friend_id_1',
                        email: 'test2@example.com',
                        name: 'Test-2',
                        avatar: 'https://bit.ly/kent-c-dodds',
                        status: {
                            _id: 'status_id_1',
                            status: 'online',
                            lastSeen: '2024-01-08T12:30:00Z',
                        },
                    },
                ],
            },
            chat: {
                _id: 'chat_id-3',
                participants: [
                    {
                        _id: 'user_id_1',
                        name: 'Test User',
                        email: 'testuser@example.com',
                        avatar: 'https://bit.ly/dan-abramov',
                    },
                    {
                        _id: 'friend_id_1',
                        email: 'test2@example.com',
                        name: 'Test-2',
                        avatar: 'https://bit.ly/kent-c-dodds',
                    },
                ],
                type: 'group',
                groupId: 'group_id_1',
                messages: [
                    {
                        _id: 'message1_id', // Replace with an actual message ID
                        content: 'Good morning guys!!',
                        sender: {
                            _id: 'user_id_1',
                            name: 'Test User',
                            email: 'testuser@example.com',
                            avatar: 'https://bit.ly/dan-abramov',
                        },
                        timeStamp: '2025-01-07T12:30:00Z',
                        seenBy: [],
                    },
                    {
                        _id: 'message2_id',
                        content: 'Welcome to this group..',
                        sender: {
                            _id: 'friend_id_1',
                            email: 'test2@example.com',
                            name: 'Test-2',
                            avatar: 'https://bit.ly/kent-c-dodds',
                        },
                        timeStamp: '2024-01-11T04:10:53.954+00:00',
                        seenBy: [],
                    },
                ],
                latestMessage: {
                    _id: 'message2_id',
                    content: 'Welcome to this group..',
                    sender: {
                        _id: 'friend_id_1',
                        email: 'test2@example.com',
                        name: 'Test-2',
                        avatar: 'https://bit.ly/kent-c-dodds',
                    },
                    timeStamp: '2024-01-11T04:10:53.954+00:00',
                    seenBy: [],
                },
                createdAt: '2025-01-07T12:30:00Z',
                updatedAt: '2025-01-07T12:30:00Z',
            },
        },
    ],
    friendRequestsSent: [
        {
            _id: 'Test_5_id',
            name: 'Test-5',
            email: 'friendrequest1@example.com',
            avatar: 'https://bit.ly/broken-link',
            status: {
                _id: 'status_id_request_1',
                status: 'online',
                lastSeen: '2024-01-08T12:30:00Z',
            },
        },
        {
            _id: 'Test_6_id',
            name: 'Test-6',
            email: 'friendrequest2@example.com',
            avatar: 'https://bit.ly/broken-link',
            status: {
                _id: 'status_id_request_2',
                status: 'offline',
                lastSeen: '2024-01-08T12:30:00Z',
            },
        },
    ],
    friendRequestsReceived: [
        {
            _id: 'Test_7_id',
            name: 'Test-7',
            avatar: 'https://example.com/avatar-friendrequestreceived1.jpg',
            status: {
                _id: 'status_id_request_received_1',
                status: 'online',
                lastSeen: '2024-01-08T12:30:00Z',
            },
        },
        {
            _id: 'Test_8_id',
            name: 'Test-8',
            avatar: 'https://example.com/avatar-friendrequestreceived2.jpg',
            status: {
                _id: 'status_id_request_received_2',
                status: 'online',
                lastSeen: '2024-01-08T12:30:00Z',
            },
        },
    ],
    status: {
        _id: 'status_id_user',
        status: 'online',
        lastSeen: '2024-01-08T12:30:00Z',
    },
};

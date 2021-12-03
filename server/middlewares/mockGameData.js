const mockData = {
    rooms: [
        {
            id: 1,
            name: "Room 1"
        },
        {
            id: 2,
            name: "Room 2"
        },
        {
            id: 3,
            name: "Room 3"
        }
    ],
    players: {
        /* players by room Id */
    }
};

export default function initialize() {
    return (req, res, next) => {
        req.games = mockData;

        next();
    };
}
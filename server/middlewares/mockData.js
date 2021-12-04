let id = 2;

export function getId(){
    return (id++).toString();
}
export const users = {
    "1": {
        id: "1",
        username: "Pesho",
        hashedPassword: "55124a287e8ddc58a97eb3eea634a4d3185428d552de1a2b5bd49511355ababa"
    }
};

export const sessions = {};
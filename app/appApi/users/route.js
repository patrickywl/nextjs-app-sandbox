let userInMemory = {}
let userIdStored = new Set()


function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i=0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


export async function POST(req) {
  const new_user = await req.json()
  if (!new_user.name) {
    new_user.name = "UNK"
  }
  if (!new_user.username) {
    new_user.username = makeid(10)
  }
  if (userIdStored.has(new_user.username)) {
    return Response.json({
      success: false,
      desc: "Duplicated user"
    },
    {
      status: 409
    })
  }
  new_user.id = makeid(20)
  userIdStored.add(new_user.username)
  userInMemory[new_user.id] = new_user
  const data = {success: true, "userId": new_user.id}
  return Response.json(data)
}
import { headers } from 'next/headers'
import userModel from '@/models/user.model'
import DBconnection from '@/lib/Connection'

await DBconnection()
export async function POST(req: Request){
    const webhook_secret=process.env.WEB_HOOK_KEY

    if(!webhook_secret){
        throw new Error('no Webhoook key found')
    }

    const payloadHaeder=headers()
    const svix_id=(await payloadHaeder).get('svix-id')
    const svix_timestamp = (await payloadHaeder).get('svix-timestamp')
    const svix_signature = (await payloadHaeder).get('svix-signature')

    if(!svix_id || !svix_timestamp || !svix_signature){
        return new Response("No header found in Svix")
    }

    const payload=await req.json()
    const body=JSON.stringify(payload)

    const wh= new Webhook(webhook_secret)
    let evh:WebhookEvent

    try {
        evh=wh.verify(body,{
            "svix-id":svix_id,
            "svix-timestamp":svix_timestamp,
            "svix-signature":svix_signature
        }) as WebhookEvent
    } catch (error) {
        console.log("error verifying webhook",error)
        return new Response("Error",{status:400})
    }

    const{id}= evh.data
    const type=evh.type

    if(type==="user.created"){
        try {
            console.log('creating user in mongoDB')
            const { primary_email_address_id, username, email_addresses, id } = evh.data
            const isverified = email_addresses && email_addresses[0]?.verification?.status === "verified" ? true : false
            const user = await userModel.create({
                id: id,
                username: username,
                email: email_addresses[0].email_address,
                isverified: isverified,
                chats: []
            })
            console.log(user)
        } catch (error) {
            console.log(error)
            return new Response('Error in creating new user',{status:400})
        }
    }

    return new Response("Webhook recieved successfully",{status:200})
}
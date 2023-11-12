const upstash_redis_rest_url = process.env.UPSTASH_REDIS_REST_URL;
const upstash_redis_rest_token = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = 'zrange' | 'sismember' | 'get' | 'smembers';

export async function fetchRedis(command:Command,...args: (string | number)[]){
    const commandUrl = `${upstash_redis_rest_url}/${command}/${args.join("/")}`;

    const response = await fetch(commandUrl,{
        headers:{
            Authorization: `Bearer ${upstash_redis_rest_token}`
        },
        cache: "no-store",
    });

    if(!response.ok){
        throw new Error(`Error executing redis command: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
}

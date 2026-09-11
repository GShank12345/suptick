  import { BedrockClient }  from "@aws-sdk/client-bedrock"
  import { BedrockModel } from "@strands-agents/sdk/models/bedrock"
  import { z } from "zod"
  import CryptoJS from "crypto-js"
  import { S3, GetObjectCommand, S3Client}  from "@aws-sdk/client-s3"
  import express from "express"
  import { S3Storage} from '@strands-agents/sdk/storage'
  import { LLMSteeringHandler } from '@strands-agents/sdk/vended-interventions/steering'
  import { Agent, BeforeInvocationEvent, BeforeToolCallEvent, SessionManager, tool } from '@strands-agents/sdk';
  import { ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";



  const PORT =  8080
  var i = 0
  var modelid = 'nova';
  const REGION = "us-east-1";
  var s3url = "";
  var s4url = "";
   var toolCounts : Record<string,number> = {}
   var maxToolCounts = 5
  const dateSchema = z.coerce.date();
  const validDate = new Date();
  const  date3 = dateSchema.parse(validDate)
  // console.log("date3===================",date3)
  var keyid = ""
  var seckeyid = ""
  var awskey1 = ""
  var awskey2 = ""
  const iv = CryptoJS.enc.Utf8.parse("");

 
  // var awsurl = "https://wsbyu45byb.execute-api.us-east-1.amazonaws.com/default/authsuptic"
  var awsurl = "https://2d6fcanvsxi2u656q5r4xiinfe0azoqk.lambda-url.us-east-1.on.aws/"


  const app = express()
  export const main = async () => {
  try {
    const resp = await fetch(awsurl)
    const data2 =  await resp.json()
  // console.log("The data2",data2)
   console.log("The data2 val",data2.val1)
   if (data2.val1 != undefined)
  {
  //  console.log("Inside ================",)
  awskey1 =  CryptoJS.AES.decrypt(data2.val1,"",{
    iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8)

   
  }
  if (data2.val2 != undefined)
  {
  awskey2 =  CryptoJS.AES.decrypt(data2.val2,"",{
  iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7

  }).toString(CryptoJS.enc.Utf8)

  }

    } catch(error)
    {
      console.log("Unable to get AWS Credentials", error)
    }

    
    // JS SDK v3 does not support global configuration.
    // Codemod has attempted to pass values to each service client in this file.
    // You may need to update clients outside of this file, if they use global config.
   // AWS.config.update({
   // accessKeyId: awskey1,
   // secretAccessKey:awskey2,
  //region: 'us-east-1'
   //})

  const s3 = new S3({
   credentials: {
    accessKeyId: awskey1,
    secretAccessKey:awskey2,
  
   },

   region: 'us-east-1',
  })

  const params = {

    Bucket: 'ticketsup',
    Key:'supporttic.json'
    
  };
  const params1 = {
    
    Bucket: 'ticketsup',
    Key:'supportsoln.json'

  };
   // s3.getObject(params, async (err: Error | null,  data: any) => {
   const data = await s3.send(new GetObjectCommand(params))
   try {
    if (data.Body != undefined)
    {
    //  console.log("inside The bucket==========")
    s3url = await data.Body?.transformToString("utf-8")
   //  console.log("The bucket==========", s3url)
    }
    // s3url = "https://ticketsup.s3.us-east-1.amazonaws.com/supporttic.json"
   
    }
   
  catch (err) {
    console.log("Unable to get the bucket",err)

  }
  
   //  console.log("connected===========",data.Body?.toString())
   
 // s3.getObject(params1, async (err: Error | null,  data1: any) => {
  const data1 = await s3.send(new GetObjectCommand(params1))
   try {
    if (data1.Body != undefined)
    {
    s4url = await data1.Body?.transformToString("utf-8")
   //  console.log("The bucket==========", s4url)
    }
    // s3url = "https://ticketsup.s3.us-east-1.amazonaws.com/supporttic.json"
   
    }
   
  catch (err) {
    console.log("Unable to get the bucket",err)

  }
  //}
   //})
// console.log("The bucket==========s4url")
  //////*************** Agent management */
  // const storage = new LocalFileStorage('./')
  // const storage = new InMemoryStorage()
 
  const session = new SessionManager({
   
    sessionId: 'support-session',
   // storage: new S3Storage( "ticketsup")   
     storage :  new S3Storage("ticketsup",{    
        prefix: "session",
        s3Client: new S3Client({
            credentials: {
                    accessKeyId: awskey1,
                    secretAccessKey:awskey2,
                     },
           region: "us-east-1",
          
    }),
   }) 
  
  }) 
  // console.log("The bucket==========bedrock-ticketsup")
  //////*************** Agent management */
  await session.deleteSession();
  // console.log("Inside delete")
   const client = new BedrockClient({ 
   // credentials: {
   // accessKeyId: awskey1,
   // secretAccessKey: awskey2
   // },
    region: REGION });
    
   // const command = new ListFoundationModelsCommand({});
   
   // const response = await client.send(command);
 
   // const models = response.modelSummaries || undefined
   
   
   // if (models != undefined) {
   // for (const model of models)
   // {
    // console.log("Inside model")
   //  if (model.modelId == 'amazon.nova-lite-v1:0')
    //{
    // if (model.modelId != undefined )
    // {
     // modelid = model.modelId
     //  console.log("Inside modelId")
    // }
   
    
  // console.log("The modelid is=========got")
   const bedrockModel = new BedrockModel({
   // modelId: modelid,
 // const bedrockModel = new ChatBedrockConverse({
    modelId: 'amazon.nova-lite-v1:0',
    //  modelId: 'amazon.nova-2-sonic-v1:0',
    clientConfig: {
     credentials: {
        accessKeyId: awskey1,
        secretAccessKey: awskey2
     }
    },
   // cacheConfig: {
    //  strategy: "auto"
    //},
    region: 'us-east-1',
    guardrailConfig: {
     // guardrailIdentifier: 'arn:aws:bedrock:us-east-1:081669677435:guardrail/d3ezwkfm0syf',
      guardrailIdentifier: 'arn:aws:bedrock:us-east-1:081669677435:guardrail/ckqakx051n1z',
     guardrailVersion: 'DRAFT',
      trace:'enabled',
      streamProcessingMode: 'sync',
      guardLatestUserMessage:true
     
    }
   // temperature: 0.3,
   // topP: 0.8,
  })
   
  
    const supportTicTool = tool({
    name: 'get_support_tic_det',
    description: 'Get support ticket number, the owner who created the ticket and their email address, ticket creation date, resolve_by date, name of the product, issue with the product, and the issue description from the specified url.', 
   // inputSchema: z.object({}),
    callback : async ()  => {
       //  console.log("Inside callback.....................", s3url)
      //    const resp = await fetch("https://www.carmanualsonline.info/kia-sorento-hybrid-2022-warranty-and-consumer-information-guide/2").then (data => {
       //    const resp = await fetch(s3url)   
      // const data3 = await resp.json()
     //  await new Promise((resolve) => setTimeout(resolve, 5000))
      const data3 = s3url.toString()
        //   console.log("The data is...........",data3)
       //   const date4 = new Date(input.date2)
        //  const diffTime = Math.abs(date3.getTime() - date4.getTime());
   // const diffDays = diffTime / (1000 * 60 * 60 * 24);
   //  const diffDays = diffTime / (86400000);
     //     console.log("The difference in time is", diffTime, diffDays)
           //  return `The Support ticket ${input.name}  was created by ${input.owner}.\n The issue is  ${input.ownerdesc}\n. The issue needs to be resolved by ${input.date2} and needs attention\n. To discuss further about the issue email the ticket owner -  ${input.ownereml}.`
      
        
           return data3
           
    },
  })
    const supportTicTool1 = tool({
    name: 'get_support_tic_soln',
    description: 'Get product name, product issue, and the product solution for the correct issue.',

    callback: async () => {
        //  console.log("Inside callback.....................", s4url)
      //    const resp = await fetch("https://www.carmanualsonline.info/kia-sorento-hybrid-2022-warranty-and-consumer-information-guide/2").then (data => {
          // const resp = await fetch(s3url)   
      //const data = await resp.json()
      const data1 =  s4url
           // console.log("The data is...........",data)
       //   const date4 = new Date(input.date2)
        //  const diffTime = Math.abs(date3.getTime() - date4.getTime());
   // const diffDays = diffTime / (1000 * 60 * 60 * 24);
   //  const diffDays = diffTime / (86400000);
     //     console.log("The difference in time is", diffTime, diffDays)
           //  return `The Support ticket ${input.name}  was created by ${input.owner}.\n The issue is  ${input.ownerdesc}\n. The issue needs to be resolved by ${input.date2} and needs attention\n. To discuss further about the issue email the ticket owner -  ${input.ownereml}.`
      
        
           return data1
           
    },
    
  })

   // console.log(`model name is ${model.modelName}`)

   const handler = new LLMSteeringHandler({
    systemPrompt: `The agent must follow the below rules strictly:
    1. Do not get tickets with a closed status in the 'supportTicTool'. Always get tickets that are open
    2. Get only tickets with a high priority status in the 'supportTicTool'. Do not get tickets with priority status low or moderate.
    3. Always compare the current month from today's date with the current month from the resolve_by date in the 'supportTicTool' tool. Only show the tickets when the months are the same.  
    4. If no records than provide no details and say 'No tickets need your attention.
    5. Use simple English to describe the issue and provide a possible solution from 'supportTicTool1'. If the issue description from the 'supportTicTool1' tool does not match the issue in 'supportTicTool' tool say, ask more clarification from the customer.
    `
  })
    const agent = new Agent({model: bedrockModel,
       tools: [supportTicTool, supportTicTool1],
       interventions: [handler],
     // systemPrompt: "You are a helpful weather tool that shows current weather conditions from National weather services API by calling httpRequest tool and sending in the zip code based on the system location. Highlight the temperature, UV Index and current weather conditions such as 'sunny','raining', or 'snowing'. Also make recomendations based on the forecast for the next 6 hours. ",
      systemPrompt: "You are a helpful support ticket tool that gets ticket information details from the 'supportTicTool' tool. Use the URL provided in the 'get_support_tic_det' tool to get information. You must show the tickets  that need to be resolved with an open status, high priority, and with 'resolve_by' month same as the current month from today\'s date. If the month and year of today\'s date and the 'resolve_by' date from the tool are the same, then only provide the details of the ticket. Use simple English to provide the details. For each priority ticked use a seperate paragraph with the ticket title and the ticket created by name on the top followed by the details in the next line. Do not provide any details or information on tickets that need not be addressed immediately. Provide today\'s date at the top of each ticket detail. " + 
      "Compare the product name and product issue from 'supportTicTool' with 'supportTicTool1'. Get the right product and issue from 'supportTicTool' and get the accurate solution from 'supportTicTool1' and suggest the solution. ",
       
    messages: 
    [                                                                                                                                 
   {
    "role": "user",
    "content":[
      {
        "guardContent":{
            "text": {
                "text":"No accurate solution available for the product. Get more details about the issue for the product from the customer.",
               "qualifiers":["guard_content"]

            }
        }
     },
     {
        "guardContent":{
           "text": {
                 "text":"I am having trouble with product Z.",
                 "qualifiers":["query"]

            },

        }

      }
   ]
 }],
     toolExecutor:"sequential",
     sessionManager:session,
    plugins:[]
   // plugins: [new ContextOffloader({ storage }), session],
    
    })
    setTimeout(() => agent.cancel(),40_000)
  // const agent = new Agent()

  // Health check endpoint (REQUIRED)
  app.get('/ping', (_, res) =>
    res.json({
      status: 'Healthy',
      time_of_last_update: Math.floor(Date.now() / 1000),
    })
  )
  async function processStreamingResponse() {
   //  const response1 = await agent.invoke("What is the current weather in North Carolina?")
    //  const prompt = "What is the current weather in North Carolina?"
   //  for await (const event of agent.stream(prompt)) {
   app.post('/invocations', express.raw({ type: '*/*' }), async (req, res) => {
   
      agent.addHook(BeforeInvocationEvent,() => {
        toolCounts = {}
      
      })

      agent.addHook(BeforeToolCallEvent,(event): void => {
        const toolname = event.toolUse.name
        const toolc = (toolCounts[toolname] ?? 0) + 1
        toolCounts[toolname] = toolc

        if (toolc > maxToolCounts)
        {
            event.cancel = `Tool ${toolname} has been called more than 5 times and it is being throttled. Do not call this tool `
        }
      })
  
    try {
  const prompt = `Find the issue and the priority tickets from the \'supportTicTool\' first then find the possible solution from \'supportTicTool1\' tool. What are the tickets that need to be resoved this month? Today's date is ${date3}.`
    const resp = await agent.invoke(req.body = prompt,{
 //  const resp = await agent.invoke(prompt,{
//   const resp = agent.invoke(new TextDecoder().decode(req.body), {
     limits:{
     turns:6,
     outputTokens: 3000,
      totalTokens: 10000,
    }, 

    
  })

 // console.log("The agent resp =========================",(await resp).toString())
   if ((resp).stopReason === 'cancelled')
    {
      console.log("Agent was cancelled due to time out")
    }
    return res.json({resp})
   
     
    } 
    catch (err)
    {
      console.error("Internal server error", err)
     // return res.status(500).json({error:'Internal Server Error'})
    }
   })

   
  } // end of process streaming
    
  await processStreamingResponse()

    }
    
  // }
  // }
   // return response;
   
   // })
   // })

   
 
 // }
 // }
  main()
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 AgentCore Runtime server listening on port ${PORT}`)
   console.log(`📍 Endpoints:`)
   console.log(`   POST http://0.0.0.0:${PORT}/invocations`)
    console.log(`   GET  http://0.0.0.0:${PORT}/ping`)
   })
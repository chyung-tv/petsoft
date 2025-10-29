() folders are called route groups, it doesnt affect url routing.
[]slug folders

shadcn
-build on radix
-button asChild param practically swap the class of the button to the enclosing child. just wrap the child inside and it becomes the button itself

###problem came across:

1. shadcn install failed for 0.8.0, i used the latest and found that darkmode implementation is overhauled to what seems like a context api. also i came across a problem that states error of @layout in global.css. but i managed thro it by initializing shadcn with latest. i thought these shit should be set up by the provider and i was right

2. nested layout by adding a layout.tsx under the root of your application. in app/(app)/app for anything under app route. the application of children seemed to by taken care of by next. this layout would go thro the root layout too

problem: i accidentally moved the logo.tsx into ui folder and next seems to be failing to get the import. need to move it out of the shadcn ui folder

usually use div to solve for layout and leave components with no layouts. let the components to take up space specified by the divs, esp for css grid. take dashboard page as an example

content block for card like base styles across the app

usually fetch data in page not in components; why?

usually fetch in layout component? why not in the context?context must be client side, so we dont fetch shits there. instead fetch in a server component then pass the data into context. i think we might also do wrap the context around dashboard tho. but who knows where will we need the data

config custom colors in tailwind config, theme, extend

PlusIcon size is not adjustable

prisma set up is seen in prisma official website.
when you created a new model, use npx prisma db push, forcful update, might lose data
on schema change, use migrate instead, keep track of data
to use, instanciate client; refer to prisma best practice on it, particularly nextjs seems to instanciate a lot connection. so that you can use .findmany() etc
seeding:

"use server" : make a ts file containing functions that you want to run only in the server, in which a client component can call direstly but it only runs in the server. this breakthrough allows one to bypass setting up api calls and following with type safety checks and validations.

for server actions, instead of using onsubmit, use action. this will work even when js is not loaded yet. also for forms it automatically pass the form data as FormData, and i would need to parse it in the server action. progressive enhancement: it doesnt need js to work.

useFormStatus vs useTranstition to get server action status. prev only need inside a form, latter is ok for any?

// const [pets, setPets] = useState(data); caused a subtle bug when transitioning from state to db connection, where data is always the initial data passed from server component, coz data change will not change pets state

how to combine serveractions with usestate snappyness? seems like useoptimistic is a solution.

    // the constructor of newPet should be handled in the form component, why?
    // because only the form component has the user input data to create a new pet
    // why not pass the input data to context provider and create newPet here?
    // because context provider should only handle state management, not data processing

// useOptimistic is used to optimistically update the UI when adding a new pet; [defineAState, setDefineAState] = useOptimistic(initialValue, reducerFunction)
// reducerFunction takes previous state and new value, returns updated state, basically you define how to update the state when setDefineAState is called
// in the begining i know that the newPet has no id, turns out petlist mapping will need an id, so we generate a random id for the optimistic pet
// it doesnt really matter since the real id will come from the db when revalidating the page after adding the pet
// in our case when db update failed, and we still updated the UI optimistically, the revalidation will fix the UI to match db state and send a toast warning

        const { pending } = useFormStatus();

//this hook needs to work inside a form with action attribute
// if we do this before the element return, it will not be able to track the form status correctly, and cause hydration mismatch

npm run build will scan thro for type error, good to run it to check for type safety

In the shadcn form seems that we are not controlling the form with useState. so Bytegrad suggest we use react hook for for a less code, less reerender form.

zod for validation
rhf for better form
shadcnui for ui compoonents
prisma for orm and db set up
whatelse did we use?
context api for state management

people can actually thro inspect browse and change the scripts. like the can delete the validations in the frontend code to send invalidate data to ur backend. so we use a integrated validation by zod to do it on both sides

// need to convert formData to object to match Omit<Pet,"id">
// cannot trigger form close coz react batches state updates, so we pass a callback from parent to close the form after action is done
// use flushSync to force react to flush the state update immediately
latest: zod took care of validation and typing

fuckingforms:

1. rhf useform to get stauts, trigger, formstates and error, things regarding the form behaviour. need to use register in the input el to hook in the form iput fields. it also allow easier set up of error meddsadfges

2. define shcema using zod, basically telling zod what is the thing u want to get out from the form look like.

3. apply a resolver in the rhf to connect zod with rhf, instead of setting up one by one in line

4. use getValues from rhf to get a casted, typed formdata

\*\* many transformation from zod only works in onSubmit but not action attribute. dunno why. but it does loses progressive enhancement
// this transform is ran after validation, so if the imageUrl is empty string, it will be replaced with the default image url.
// BG: it only works in onSumbit, not in action. why??

5. schema and type can put in a validation/schema file to centralize the maangement and can be exported to server action for server side validation, in which coerce and transform works. schema.safeParse(value). despite we typed it, when client send things to server, it still might be unknown type. so it is better to type things from client as unknown; can also do parse that when error will throw an error. maybe try put the parse inside the try catch of calling db?

// const [error, formAction] = useFormState(addPet,{} )
// this useFormState is better for progressive enhancement, it will handle the form submission without js too. but it limits to only one server action per component. here we will need to run few js functions after submission, so we will not use it.

    const {
        register,
        trigger,
        getValues,
        formState: { errors },
    } = useForm<TPetForm>({
        resolver: zodResolver(petFormSchema),
        defaultValues:
        actionType === "edit"
            ? {
                name: selectedPet?.name,
                ownerName: selectedPet?.ownerName,
                imageUrl: selectedPet?.imageUrl,
                age: selectedPet?.age,
                notes: selectedPet?.notes,
            }
            : {},
    });

herei used ?: to seperate the add and edit logic passing to rhf

\*\*auth
Cookies: a container in the browser that kind of bundle things to send to server. contains JWT or database session id with its request.

in auth, server basically need to know who is making the request to decide to server or not. uses JWT or DBSID to identify.

JWT is a string stored in cookies. dev can set expiry, but ala the JWT is valid and stored in the browser, access is granted. dev cannot revoke access otherwise. the upside is JWT goes in server only, making it faster.

DBSID is a shorter string, it goes to server then DB to match whether that toekn is valid, then send back access right to server. safer, more controll, but round trip is longer.

middleware works automatically as edge computing server, fast auth like a spinal reflex! put the file directly under src. also used to redirect user

auth third party: auth/next auth js; allows oauth

whats the diff of cuid and uuid?

modeling a relational db:
a) 1 to many
others dont know yet.

codify a relationship between models. prisma made it simplr to understand! refer to prisma.schema. when creating a pet, the pets' relationship with the user will be noted in the data. first time isee relational db in action, actually very useful!

bcryt for hashing.

import { NextResponse } from "next/server";

// export function middleware(req: Request) {
// // see what is requested by console logging the URL
// console.log("Middleware request URL:", req.url);
// return NextResponse.next();
// }

auth: install import NextAuth and const as auth in auth.ts, it can be put anywhere but a code level tool in src is proper.

openssl rand -base64 32
a cli for generating random string

so i came across two errors: missing secret after adding a secret, and after login 404.

the first one needs to restart dev server, and the latter seemed to be caused by a capital case in action/ login / signIn("credentials", authData). after i changed back the c, things did go thro.

shd get callback url, csrl token and session token.

when a user is logged in, it is in a session, and we can use the auth.user obj in server. the auth function also exist in middleware before login. if we need to use that obj in client, useSession()

BG: seems middleware does not run for every server components at time of recording. better add session check on every component

next auth set up is standard but complicated, need to go over the set up a few times to get familiar with

authorised routing is handled inside the auth function; looks ugly to me.

when trying to access protected area before login, next auth will put a callback url in the url so that once logged in it will proceed to that page. this allows one to redircet user directly when login form is submited using inline functinos to await the login. its not used here (Router.push)since the auth routing is quite enuf.

const pets = await prisma.pet.findMany({
where: { userId: session.user.id },
});
this session.user.id is from nextAuth and is undefined. they are seperate systems? however nextAuth do pass email as it is. now we made the userid to pass thro to token and session, prisma now fetch based on the userid. however it needs to logout to destroy toekn to take effect. isnt it better if we get the user id by prisma email?

zzzz the whole auth is a disaster

if we use auth or session, the usage needs to be included in the request response cycle i.e. you cannot use it in H1 component? since the request will be sent including the token and therefore the session information. then can be used to verify auth of cruds.

for edit and delete, besides auth (login state) we also need authorization(does the request come from an entitlted entity?)

maybe the auth and authorization we can abstract ass a seperate function for nicer structure.

npm i and import server-only; to make sure cannot be used in client coponents.

api route handlers
useSession hook into it
ffor nextauth.
[...nextauth] match all route . anything afyer api/auth will go there

use if statements to filter unexpected types

auth server actions. need to zod them and then screen for object we want before really implementing. TS forces us to be robust.

useFormState hook, use dispatchFunction to connect the actual function to the action, gets the error obj.
the first arg is the function, second is the state. need to set the state to undefined. not sure how exactly it works.
retains progressive enhancement with error state.
signature of server action changes. when there happens an error, it will be passed as the first argument in the next function invoke.

alternative is to pass a ()=>{} in the action

<!-- copilot task -->

Check out how we implemented auth in our app, provide a step by step guide and explain data flow and logic in the inplementation for later review.

<!--  -->

usTransition();
invoking server action outside a form, use it to obtain the state ofr the action

webhook: expose a "mailbox(route handlers)" where external servers can send u sth

/payment?success=true redirect and obtain payment status; can then request a new token

one thought: what is switch? can we use switch for better logic in authorized callback function? how switch differ from if else?

ngrok/proxy receive webhook and forward it to server

process:
install ngrok
cli: ngrok http port.you.wanted/3000

set up stripe to send events to this testurl/api/stripe

route.ts will be invoked and POST function will be ran upon receiving a POST.

verify webhook sender

POST need to return sth, otherwise stripe takes it as 500.

run prisma to change hasAccess to fufil the product.

after payemnt jwt is not refreshed automatically

useSession needs to be added inside a wrapper, like context provider.

what does a useRouter do and where can we use it and when do we need it?

update() from useSession triggers jwt callback; need to handle it in auth.ts

log things to hunt doen the problem

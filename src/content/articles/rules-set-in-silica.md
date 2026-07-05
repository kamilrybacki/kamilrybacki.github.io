---
layout: article.njk
title: "Rules set in silica"
date: 2026-07-05
category: AI, programming
description: "Article about making a try at leveraging deterministic engines for automating the validation of logic and business rules in AI systems."
tags: []
draft: false
---

## Logical harnesses for pinning down abstractions

I remember one of the lectures during my computational physicist phase, where my future supervisor told us tales about actual philosphers
being employed by big companies
to think hard about more abstract stuff going around the weird,
corporate environment they've found themselves in,
racking in a substantial amount of money.

At that moment, I thought it was just purely a way to encourage us
that the academic way of life can be easily married with ruthless realm of pencil pushing entities,
hidden away in the harsh conditions of carefully measured cubicles.

Over the time, my view on the academia and business rounded around its edges
and, more importantly, got more grounded in reality,
mainly due to slowly transistioning from one to the other,
thus finding the appreciation for both of them and their role in my life.

Moreover, the area I am working in still has patches of the usual systematic, scientific approach,
just on a less lofty scale of quartely reports and product requirement documents,
where the performance numbers and costs-to-gains rations are plucked straight
from simulating the target system's performance in their nascent, proof-of-concept state.

In short - we do research in due dilligence to show profit on paper,
convince the corporate and then translate it to profit in the books.
Knowledge thus, is directly converted to confidence and ability to move forward
with new ventures,
in a nice parallel to way in which academia in general does that to the domain
of our human knowledge.

So, what else can we borrow from the scrolls of old?
Are there any lifehacks laying around the dusty tomes that can be used for our profit?

Here, we can somehow return to our aforementioned philosophers,
and try to squeeze out some new parallel to how their methodology is reflected
in the way in which we organize the knowledge that is later shaped into everyday products.

Over time, both the silica and parchment have accepted one thing in common,
which is a structured way in which the state of some portions our world can be condensed into intertwined instructions,
the dos and don'ts of processes we observe and thus, can predict
having those rules organized in nice, nifty packages we call theorems.

The act of programming overall is our way of controlling how the data in general
flows through the abstract gates we come up with to reach our desired goal,
creating pipelines that spew out value for our customers, and also
more insight for us on how to steer thhis whole machinery further,
mainly through auxiliaty observability tools and business metrics carefully collected over time.

Business is logic applied, sometimes with some bold assumptions and simplifications,
but the rule of cause and effect still holds strong in its domain.

The perspective of C-suite is also important to consider here,
because it does not operate in terms characteristic to lower level, operational
details,
but those which are more "human-readable" i.e. aimed towards interpretation of a crowd far wider than programmers tinkering with implementational details.

Buidling sufficient bridges for communicating the intenr between battle-hardened engineers and managers,
so both groups can contribute to measurable betterment of maintained systems
is crucial not only from the perspective of raw profits,
but also can build trust between those two rungs in the corporate ladder.

That is also why one of the most common approaches is to establish software development cycles,
where both groups can collaborate using documentation that is structured in pre-determined way.
Product requirement documents, requests for commentaries, post-mortems in case of accidents etc.
Thanks to those artifacts, developers can then reshape their contents into implementation plans and quality assurance strategies, and then finally into code.

However, this process has two caveats, that can be crucial to the keeping everything working correctly and/or improving current state of things.

First of all, when compared to automated CI/CD pipelines and other engineered machinations,
this process is slow - and there is no beating around the bush about that.
What if the PM or the tech lead is off? Then the process is pushed more forward in time,
depending on how strict are the rules on the review of PRDs and other agreements.

The second issue is with the confidence in the newly established logic.
Why? Because, even though engineers and other more technical people are involed in them,
the discussions are made "in the vacuum" and often cannot be reliably confirmed
or rejected in cases where the buisiness logic is seriously intertwined.
If even **one person** who held an important tidbit of knowledge or has put up
their own Chesterton's Fence in the product leaves the company,
the presence of the new rule can create an inconsistent system of instructions,
that will break around those abstract seams left by not sufficiently documented caveats.

We can find a historical example of this mismatch in the way of how software engineering has evolved during the last decades
to tackle another set of abstract requirements
in a systematic and repeatable manner, that lowers the barrier of their enforcement.

Code styling conventions. Before the advent of automatic linting tools,
stuff like line lenghts, naming of private or public variables
and other intricacies of producing aesthetically pleasing codebases
were always a topic of lenghty discussions between programmers,
both on their free and company time e.g. "spaces over tabs".

By introduction of the commonly agreed upon linting setup,
the zoo-like state within those development teams could have been finally ended.
Why? Because it became **a system**, something that has been baptized from above
and to be respected from that point forward.
Additionally, since it is an actual **tooling** now, it can be easily
hooked up to a plethora of automated quality assurance pipelines,
reducing the friction of use even further.
The end state is that each programmer can produce code **standardized in style**,
increasing the **confidence** of other team members that is can be easily traversed by them.

What if business logic itself could be controlled using similar measures
i.e. some fully or even semi-automated workflows that will take a portion
of responsibility away from people involved in development process,
but giving them back consistency in return?

What can we borrow from academia to help us forge such solution?

## We will be either able to do that, or not able to do that

From the point of logic in sense of the actual branch of mathematics it represents,
there is an entity which is called a **tautology**.
No matter how You interpret it, it will **always be true**, so its logical
value stays fully determinant and idempotent of whatever happens in other parts
of the system of statements it is included in.

Believe it or not, everytime somebody offers You a `free gift` for something
(or just out of the blue) - they are also giving You an extra tautology bundled with it.

A gift, by definition, is free. There is no point of adding that word to it.
To show it even more bluntly, if we ever point at something which is being "offered" and say:
`This gift will cost You 1.99$`, we commit a logical fallacy.

So, where do tautologies existing in the corporate world?
Practically speaking, whenever any requirement is set "from above"
on how the product is supposed to function from business perspective.

1. "The minimum price we can charge for our product to still make profit is `A`"

And it is what it is. Everything which produces profit and can be expressed in a form of rule, automatically becomes this magical logic entity.

Of course, this setting in stone can also happen on an engineering level
where certain permanent decisions are made for the good of the company.
A good example are any performance-centered acceptability criteria that are
directly connected to operational costs measurable "from the outside":

"The log retention must be set to the maximum of `X` days,
due to our budget for the cloud infrastructure, and thus, the storage"

This simple rule, which is set to be universally true from that point onwards,
influences any futher implementation details for things like automated observability tools,
or in short, anything that interacts with the historical data mined from these logs.

Of course, my classification of these things as tautologies is not only
for the dramatic effect of this article, but has its practical roots.
Knowing that these things are always true and cannot be violated,
sets some very useful guardrails for us that box in any further decisions.

Take the pricing example shown above and the following set of freshly cooked buisiness logic given to us after some meeting between devs and corporates:

1. "For customers from group `X`, we will always apply a hidden discount of `Y`
because they will be more likely to buy our service".
2. "During summer, we will apply an universal discount of `Z` as a promotional campaign"

Now, if the "rule zero" for the customers from group `X` is skimmed over,
You can pretty easily imagine a case where after applying both
`Y` and `Z` discounts we will fall below the threshold of `A` for the price
and start slowly bleeding money. If the effect is drammatic, then good for us,
because it can be easily caught, but what if we have millions of users paying
even couple of cents below the margin?

Operational mishaps also burn dollars, because if a developer happily sets unlimited logging for some service, because "more data is good",
Amazon will happily bill us for the extra bucket storage,
**especially** for the over-the-top reads and writes to them.

Having those safe determinants of our business centered system, can prevent us from falling into those costly traps paved with good intentions.

To be pedantic, I will use a new term for such logical anchors: **domain tautologies**. Additionally, we now have freedom to use the logical operations,
borrowed from actual mathematics, to combine them into more complex statements, that can be used to express more intricate business rules
*or* (and here is the kicker) to **validate** the existing the newly introduced ones.

## Business-centered squiggles

Let's go back once again to the pricing example, and try to express it in a more formal way, using the logical operations.

The first tautology can be expressed as a statement that is always true,
so it can be always safely assumed as a fact in any further reasoning.
Expressing the total discount applied to the price $P$ of the product as $D_x$ for **any customer $x$**, we can express the discounted price as $P_x - D_x$. Then, the first tautology can be expressed as:

$$\forall x \, (P_x - D_x \geq A)$$

Introduction of the next two rules to our logical system, creates a new condition that for clients from group $X$ during summer, the total discount applied to the price will be $D_x + Z$. Thus, we can express the new discounted price as $P_x - (D_x + Z)$ during that period:

$$\forall x \in X \, (P_x - (D_x + Z) \geq A)$$

and this is where the problem arises, because if we do not have a proper validation of the new rule, we can easily fall into a trap of violating the first tautology, for incorrectly chosen values of $A$, $D_x$ and $Z$.

The solution to this problem is to **validate** the new rule against the existing tautology,
which can be done by checking if the new statement is logically consistent with the first one,
but it can be cumbersome and error-prone if we do it manually and of course,
is not doable without setting up these numerical boundaries in the first place,
to escape the realm of mathematical abstraction and enter the world of business reality.

Logic also gives us a way to express in structured manner things such as
total sets of **allowed states** parts of our system can be expressed by
at any given moment of time.

Let's say we are running a business that deals with shipping of some goods,
and a client has made a succesful order, but (due to some technical mishap)
failed to complete the transaction so money did not land in our account yet.

Our system, before that, will (hopefully!) have the following tautology set in place:

1. "Only paid orders are to be shipped"

Now, we define the following set of states an order can be in as:

- `PENDING` - the order is created, but not yet paid,
- `PAID` - the order is paid, but not yet shipped,
- `SHIPPED` - the order is shipped, but not yet delivered,
- `DELIVERED` - the order is delivered, but not yet confirmed by the client.

The state of the order, let's call it `S`, can be changes by appying transformations to it,
which in out code are simply functions that either take in the initial
information about the order and spew out its new version or simply
mutate this portion of the shared state.

One of such functions can be `ship` that takes an `order` in `PAID` state and transforms it into `SHIPPED` state, but if we try to apply it to an order in `PENDING` state, it will throw an exception.

So how can we express the above tautology in a more formal way, using the logical operations?

$$\forall order \, (S(order) = PAID \implies \text{ship}(order))$$

Knowing that the outcome of $\text{ship}(order)$ is `SHIPPED`, we can also express the above tautology as:

$$\forall order \, (S(order) = PAID \implies S(\text{ship}(order)) = SHIPPED)$$

This is a simple example of how we can express the allowed transitions of states of our system in a more formal way of logical sentences,
and how we can use logical operations to validate new rules against existing tautologies.

Soooooo... now having some kind of engine or framework that can take a bunch of logical statements and validate them by creating mathematical proofs
composed from these tidbits inspired by our business doimain would be pretty cool?

## LEANing into the automations

Surprise, there is a way to do that, and it is called [Lean](https://leanprover.github.io/). It has been gaining a lot of traction in the last couple of years,
because methamticians often had problem with proving their theorems in a way that is both rigorous and reproducible,
**AND** do it in asynchronous collaboration with other experts,
where each one of them would have the same set of axioms and definitions to work with,
but would be able to contribute their own proofs to the shared knowledge base.

You can think of it as a framework for logic that had a "standard library" already baked in so they can collaborate on the shared base of material,
so it is not that far away from the way in which we collaborate on codebases using GitHub, GitLab or BitBucket.

The way in which LEAN works is that it takes a set of axioms and definitions, and then allows you to define new theorems and prove them using the existing ones. It has a powerful type system that allows you to express complex mathematical concepts in a way that is both rigorous and expressive.

So, taking as an example the case of dynamic pricing shown above, we can express the first tautology as an axiom in LEAN, and then define the new rule as a theorem that we want to prove.

If we can prove the theorem using the existing axioms and definitions, we can be reassured that the new rule is consistent with the existing tautologies.

The only caveat is that we need to express the business logic in a rigorous way LEAN does it for mathematical domain. For example, here is how LEAN expresses the first tautology:

```lean
axiom min_price : ∀ (P D A : ℝ), P - D ≥ A
```

And the new rule can be expressed as a theorem that we want to prove:

```lean
theorem summer_discount : ∀ (P D Z A : ℝ), P - (D + Z) ≥ A
```

How many business-oriented people would be willing to learn this kind of syntax and semantics? To ponder weather some knob in the system is to be expressed as a real number or a complex value? Zero - and I guess we can also treat it from now on as a truth set in stone.

However, during past couple of years another interesting effect has been
popping up around the software development workd,
that deals with similar translation conondrum between non-techy business people and engineers: generative AI.

## Troubles of synthetic philosophers

Approaching this relationship from totally general standpoint,
we have one group of people that have abstract knowledge, specific to some domain,
that need to be translated into functional form of ready-to-sell products,
for which the other group of people have the technical knowledge to implement them.

A very popular pitfall that is inherent to wide-spread GenAI usage is the
emergent opinion that, now, the same business people can use the natural,
human language to express their needs straight to the machine,
which will (thanks to its "infinite" knowledge, but total lack of context) produce
perfectly working code, because agents **will always** tell them that
their new introduction is a *really good idea* and will be *fully compatible* with the existing system.

And sometimes it is really hard to distinguish sycopathic rambling from real
insightful advice or confirmation, especially when You come up with some
"genius idea out of the blue" and the agent is just echoing it back to You,
but in a more convincing way. There is a reason why we don't use LLMs for linting, because they are not deterministic and can produce different results for the same input.

Is there some threshold where some model is good enough to be trusted
with taking a look at the WHOLE business logic and coming up with an opinion
about a newly added rule? Maybe, but even if we would be able to pitch in
such logical exercises to some **mythical** grade AI, there is still inherent
stochasticity in the way it reasons, so - by definition - this wouldn't be
a strict, deterministic, **trustworthy** method.

**BUT**, translating natural language into structured forms, that then
can be used to perform logical calculations of synthetic proofs -
that's the sweet spot!

In May I've attended Data Innovation Summit in Stockhol, where a lot of
companies were showing off the wais in which they have been applying language models
in their typical data mining and analysis processes and one talk caught my attention. Long story short, one of the uses of AI shown there there were specialized
**small language models** (or just low-power language models) that were trained
to distinguish newly emergent data schemas in the incoming streams, which could
be quickly translated into new tables in the data warehouse, and then used to perform analytics on them.

So, semi-abstract structures in - concrete schemas out (semi- because the incoming content can be messy, but the data packet as a whole it is still adherent to some kind of envelope like the way in which Kafka defines a message or an HTTP REST API returns the payload).

Now, we can take this idea and just adjust it to our LEAN-centered translation problem.

## Letters of intent

<!-- ```contract
case ApproveRequestedPlayer
operation: approve
entity:    Participation
intent:    The host approves a pending request only while seats remain.
requires:  request.status == Requested
           request.seatsAvailable == true
ensures:   result.status == Approved
examples:  - given: status=Requested, seatsAvailable=true; then: status=Approved
           - given: status=Requested, seatsAvailable=false; applies: false
``` -->

And easy way of envisioning such entity to express business rules,
would be to use a **contract**-like structure, which utilizes a **behavioral**
approach to expressing how our system should process information.

For those familiar with Behavior-Driven Development (BDD), the usual formula
used to encapsulate such rules is the "Given/When/Then" form.
In that approach, we can express the preconditions, the action and the expected outcome in a structured way, that can be easily translated into a formal representation.

In our case, the behaviors are the state-change operations performed on the
domain entities existing within our system, that have a certain **intent**
behind their use in specific situations.

For example, returning to our shipping example, we can express the `ship`
operation as having an **intent** of transitioning our **order** entity from `PAID` to `SHIPPED` state,
but only if the precondition of the order being in `PAID` state is met.

So, in our `contract`, we would need to specify:

1. What is the **business case** the contract is expressing? (useful when somebody would try to read it in the future or duplicate an already existing rule)
2. During which **operation** within the system the rule is to be enforced: we can have different business rules "living" in the same place of our codebase e.g. different ways of approving a request for participation in a game, depending on the type of game and the number of players.
3. Which **entity** the rule is applied to: this would be the domain object that is being manipulated by the operation, and whose state is being validated against the rule. Useful to quickly catch surface-level errors like trying to access a property of an entity that does not exist in the current context.
4. What is the **intent** of the rule: this is a short description of what the rule is trying to achieve, and can be used to quickly understand the purpose of the rule without having to read through the entire contract.
5. **Preconditions** which are required to be met before the operation can be performed. These are the conditions that must be true for the operation to proceed i.e. the "Given" part of the BDD formula.
6. **Postconditions** which are expected to be true after the operation is performed. These are the conditions that must be true for the operation to be considered successful i.e. the "Then" part of the BDD formula.
7. **Examples** which are specific cases that illustrate how a rule should be applied. These are useful for testing and validating the rule, and can also serve as documentation for future reference.

After defining the new `contract` structure, we can express the `ship` operation as follows:

```contract
case ShipOrder
operation: ship
entity:    Order
intent:    The order is shipped only if it is in PAID state.
requires:  order.status == PAID
ensures:   result.status == SHIPPED
examples:  - given: status=PAID; then: status=SHIPPED
           - given: status=PENDING; applies: false
```

The benefit of this object is that it can function as a **versionable** artifact, that can be stored in a repository and used to generate both documentation and code for the business rules.
Business people are able to read it and understand the rules, while language models can use it to generate code that enforces the rules in the system.

Having such enveloped input, it is easy to point our model to it and ask it kindly to generate appropriate LEAN proof for the new rule, that can be validated against the existing tautologies.

Case in point, the `ship` operation can be expressed in LEAN as follows:

```lean
theorem ship_order : ∀ (order : Order), order.status = PAID → ship(order).status = SHIPPED
```

For a normal mortal being, this syntax is on a different plane of existence,
but an LLM can just spit these types of things out, because it has been trained on a lot of code and can recognize patterns in the input.

Another advantage of this approach is reversing the chicken-and-egg problem,
because at some point it would become very hard for us to confidently say,
in complex systems, what are the existing state transitions happening around
our code. Do we have some code that can take an order in its `SHIPPED` form
and transition it to the `PENDING` state?

Well, having all of the live contracts in one place, we can just ask the model to generate a list of all the operations that can be performed on the `Order` entity, and then we can use that list to generate a state transition diagram for the entity. Simple as.

Also, I did not mention BDD and testing in this article without any purpose,
because `contract`s can be used as a fodder for an AI agent working with us on a codebase,
helping to generate tests and ensure that the implementation adheres to the specified rules.
We can literally just point it to a directory with contracts and say: `Generate E2E tests for business cases present in this directory`,
and it will generate a suite of tests that can be run against the system to ensure that the rules are being enforced correctly.
This ties together all of the parts of development process, from business requirements to implementation and testing,
in a way that is both rigorous and efficient.

So, this augumented process would look something like this:

1. A business person comes up to us with a new rule that needs to be enforced in the system: they know the **intent** and a **business case** for it, but they do not know how to express it in a formal way.
2. We either create the `contract` ourselves, ask the business person to fill in the template or brainstorm with LLM to generate a draft of the `contract` that can be refined by both parties.
3. We feed the `contract` to the LLM and ask it to generate a LEAN proof for the new rule, that can be validated against the existing tautologies.
4. We run the generated proof through the LEAN engine to ensure that it is valid and does not violate any existing tautologies.
5. We generate code that enforces the new rule in the system, using the `contract` as a reference for the implementation.
6. We generate tests that ensure that the new rule is being enforced correctly, using the `contract` as a reference for the expected behavior.

How can we plop this into existing SDLC processes? Have a dedicated section in the PRD (Product Requirement Document) for the `contract`s, that can be reviewed and approved by both business and technical stakeholders.
This way, we can ensure that the rules are being enforced correctly and that the system is behaving as expected.

So, the tool...

## Tauto

Together with my friend, Claudius, we have cooked up a service, that can be called directly or via MCP from agentic harnesses.

It's name is [**Tauto**](https://kamilrybacki.github.io/tauto/) and it is a service that can be used to generate LEAN proofs for new rules, that can be validated against existing tautologies.

Combined with custom-tailored skills, it can also generate code and tests for the new rules, that can be integrated into the existing system.

To test it out I have added it to a side-project I am working on,
which is a [web platform for people to create live boardgaming sessions](https://meepmap.com/),
with score tracking and other features, that can be used to play **offline** both with friends but also with strangers.

The domain of MeepMap is a nice specimen for this kind of exercise, because
the business logic is genuinely intertwined: a `GameSession` moves through
its lifecycle (open → started → closed, with cancellation and expiry branching
off), while `Participation` rows — the seats at the table — live their own
little lives (requested → approved → declined and so on), and the two state
machines gate each other. You cannot approve a player into a full table,
you cannot join a session that already started, and an anti-cheat trigger
freezes the whole roster once the game begins, so nobody can retroactively
forge who was sitting where.

The interesting question turned out to be reachability of the end states defined in the code.

Because `tauto` knows the full state domain of every entity (the glossary declares it, and the database `CHECK` constraints confirm it), it can ask something no unit test ever asks: *is there any rule at all that ever produces this state?*

```text
Participation.status: 6 states · 4 transitions
  isolated: Waitlisted, NoShow   ← no rule reaches or leaves these states
```

Two states, declared in the schema, that the formalized system could never
enter. And this is where it gets embarrassing in the most instructive way
possible.

`waitlisted` was not some forgotten stub. MeepMap had shipped an entire
waitlist experience around it: the session view rendered a "waitlisted"
join state, the host panel had a label for it, a database trigger emitted
`request_waitlisted` notifications, the session-close logic auto-declined
`waitlisted` players, check-in explicitly excluded them. I just, totally forgot about.

Another one, `no_show` - the simpler of the siblings. I had declared it in the schema, settable by an admin tool, and otherwise touched by absolutely nothing.

So this also signalled to me that, once again, I totally forgot to finish up that feature.

Both findings became actual product work, and this is where the
"rules live with the code" discipline earned its keep. 
The waitlist fix was super smol i.e. one server action and one button, landing in the same commit as three new contracts (`WaitlistRequestedPlayer`,
`ApproveWaitlistedPlayer`, `DeclineWaitlistedPlayer`).
For the `no_show`, I added a new contract and a single line to the admin tool. 
This also required some grooming of anti-cheat logic, especially around the session-close path, but the whole change was still a single PR.

A small CI job now guards the whole arrangement: on any change to the
contracts, a single docker run of the tauto image re-parses them, re-checks
the conflicts and re-builds the Lean workspace.
After the aforementioned fixes, the same lifecycle analysis that flagged the two ghost states now reports, for both entities:

```text
isolated: []
Eighteen rules, sixty-three proof obligations, all discharged. Two findings,
two shipped features.
```

My crazy idea seems to be working: the rules can now be set in silica.
I will for sure continue tinkering around `tauto`, but I think the whole
idea of deterministic business logic proof engine in its crazy way can
bring some extra velocity to the process of introducing new rules into the system,
**WHILE** also having human-readable contracts living alongside the code,
that can be used to generate documentation and tests for the new rules.
Maybe we can have some win-win-win situation here, where the business people can express their intent in a structured way,
the engineers can generate code and tests for it,
and the system can be validated against existing tautologies?

I think this might be worth exploring further, and I am excited to see where this idea can take us in the future.

## The logical conclusion

I want to be precise about what this does and does not buy you, because the
whole point of dragging Lean into this was to escape wishful thinking, and it
would be a shame to smuggle it back in through the marketing.

`tauto` is a consistency and completeness checker over a set of rules. It
will prove your rules do not contradict each other, that each rule can
actually fire, that a rule agrees with the examples you stated for it, and
that your state machines have no unreachable branches.

Of course, it will not tell you whether your rules are *good* or *correct*. But for sure it will tell You if it is **solid** in the domain You have defined.
So we have stripped down the sycopathic LLM to a single, deterministic task: translating human intent into a formal representation that can be checked for logical consistency. The rest of the system is all deterministic.

The philosophers from that lecture were hired to think hard about abstract
things so the company would not have to rediscover them expensively later.
It turns out you can now put a fair chunk of that job into a Rust binary and
a proof assistant — as long as you are honest about which part still requires
someone to sit down and decide what ought to be true.

And then, the dusty tomes can deliver to us, simple people of business, once again.

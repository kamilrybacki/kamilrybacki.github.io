---
layout: article.njk
title: "Unpunched cards programming"
date: 2026-01-06
category: Hobby
description: "Article about signs of software design patterns that can be found in the beautiful art of trading card games deckbuilding process."
tags: []
draft: false
---

## Systematic observation

COVID-19 and dice-rolling fever. Two very contagious afflictions have become a prevalent part of our post-pandemic world since their rise in 2020. This unusual coupling has been reported multiple times by the media or in numerous internet articles; one example is a concise explanation provided by [Jackson Hill from Oak Park High School's TALON newspaper](https://oakparktalon.org/16817/feature/board-games-are-making-a-comeback-heres-why/). It outlines the two most important factors that have led to this reemergence of many of our now favourite wood/paper/plastic adventures - longing for social interaction (combined with a need for a system to incentivize such activities) and board games becoming more entertaining due to them ditching pure luck-based aspects.

I remember talking about this with my colleagues, both during and after the lockdown, during our weekly sessions of Dune: Imperium (which rocks, and you should totally check it out). We often came to one of the conclusions that seems to make sense, taking the wider context of being forced to remain within our own four walls for an undisclosed amount of time - people often forgot how to socialize, or at least their "muscle memory" for these activities diminished greatly.

Board and trading card games provide a good scaffolding for constructing social events, which can help to get back into the loop **OR** in some cases, to finally break through the discomfort felt by the more introverted people and polish up their banter and small-talk skills.

This beneficial crossroads for people from different socioeconomic backgrounds to spend time together and exist together in an abstract world for some time matches the concept of "the Third Place", proposed first by Ray Oldenburg in his book ["The Great Good Place"](https://www.amazon.com/Great-Good-Place-Bookstores-Community/dp/1614720975) - a place which is inherently **neutral** and has an intrinsic community-building property. Within them, we **know what to do**, and there is a set of established **codes of conduct and interactions** already created for us. This "social lubricant" functionality has been prevalent even in [ancient times](https://www.researchgate.net/publication/301645780_Facilitating_Interaction_Board_Games_as_Social_Lubricants_in_the_Ancient_Near_East), starting from the first round of the Royal Game of Ur up until today.

Some of this information can come directly from the system we choose to apply, i.e. the actual board game we want to play and its rules, but also there are some best practices and general courtesies baked into the gaming culture, e.g., no cheating, helping the "newbies" or keeping track of various game events and triggers together. Want another example? MMOs (and especially **raiding** in titles like World of Warcraft) have also been found to match these characteristics, as seen in a very interesting paper by Steinkuehler and Williams *Where Everybody Knows Your (Screen) Name: Online Games as “Third Places”*, but I guess a lot of You also have some experience in playing team-based online games in general. Common goals and community - that is what got us hooked.

**BUT**, I have also noticed something interesting when it comes to the type of people I encountered during my tabletop journeys in my area, which is a relatively big city (Gdańsk) with several tech companies establishing themselves here: **I frequently encounter other IT workers, especially programmers and data analysts**. We often laugh about it in such situations, joking that playing cards or board games is a pretty efficient way to network in this field right now. I remember also a discussion from the `r/boardgames` subreddit, where somebody straight-up asked [*What does the average board gamer do for a living?*](https://www.reddit.com/r/boardgames/comments/1e6htke/what_does_the_average_board_gamer_do_for_a_living/). A dude from New York popped into this thread, sharing an interesting statistic from his decade-long "career" in board game meetups:

> I've gone to a weekly board game meetup in NYC for over 10 years. It is held at a bar so trends to be more like people in their 20s & 30s, so not a complete sample. But over a long long time, including periods where you'd see 100 people a night, to 15 people a night, the occupation ratio stayed remarkably consistent. It was about 30-35% lawyers, 50-55% tech (broadly defined), and 10-15% a very broad other. Where the "other" category was all over the place.
>
> -- User [*puertomateo*](https://www.reddit.com/user/puertomateo/) responding to the question in the Reddit thread

So, is there some other attractor that makes these kinds of people gravitate towards rule-ridden sessions of beating futuristic, eldritch, or fantastic creatures together? Why do we want to accumulate and scrupulously count the cute little blueberries under the shade of the Ever Tree together? And how can I make it all segway into Magic: The Gathering, since for the past year I've been obsessing over my collection of shiny, rectangular pieces of kitchen-sink fantasy?

## Printed circuit cardboard

First of all, which factors that are deeply connected to the actual gamification aspect of board games can be seen overarching into what IT professionals create and interact with daily?

### Serial cardgamer profile

One of the hints can be sourced directly from Mark Rosewater's article, [published in May last year](https://magic.wizards.com/en/news/making-magic/the-three-magic-psychographics), who is Wizards of the Coast's head designer for the game since the early 2000s. In his list of psychographics for the various types of trading card games, two profiles can give us a hint towards this possible technology-related connection:

#### Johnny/Jenny

> When I started playing the game, I loved building decks, but I didn't build normal decks. My specialty included decks that won in untraditional ways. I wanted to beat you in a way you didn't see coming. Doing this said something about who I was. I was creative, clever, and untraditional. My friends would ask to borrow my decks because they were fun to play, and that brought me great joy. *Magic* was a means to communicate my identity for all to see.
>
> -- Mark Rosewater *The Three Magic Psychographics*

A player who is focused on the art of self-expression and savviness in the field of mechanics, which can both be realized through **deck building**. By having the knowledge of best practices of building a good deck of cards (such as providing a nice [mana curve](https://magic.wizards.com/en/news/feature/how-build-mana-curve-2017-05-18)) and experience in using various mechanics specific for a given game expansion e.g. [warping from Edge of Eternities set](https://magic.wizards.com/en/news/feature/edge-of-eternities-mechanics), Johnny/Jenny can build novel solutions that combine selected subsets of cards from the game's rich library and come up with consistent strategies for winning games.

#### Spike

> Spikes look at *Magic* and see all these as opportunities to learn and improve. That's the joy for them: gaining knowledge, applying that knowledge against worthy opponents, adapting, gaining new insights, and evaluating how to change their behavior to do better next time. *Magic* requires so many different skills, and different Spikes will focus on different ones. The one through line is that Spikes will set goals for themselves and then strive to meet those goals.
>
> -- Mark Rosewater *The Three Magic Psychographics*

This one hits to our IT home even closer than the previous psychological profile due to the fact that it is what software engineers **literally do every day** as little (compared to the scale of gigantic data centers we hack through), human optimization engines: we absorb hundreds of code snippet lines and documentation pages to adapt this wisdom to **vanquishing bugs** and/or creating **new high-power systems** (a counterpart for Spike's competitive-level MTG deck) that we **tinker with over time** to make it better, faster and stronger (not harder tho, it may be an anti-pattern).

I highly recommend the aforementioned article or episodes 1230 and 1232 of Mark's *Drive to Work* podcast, which talk in-depth about these mental models, but as You can see, the usual IT engineer (or in a broader sense the majority of STEM field specialists) can be seen as different mixtures of J's and S's with some personality customizations baked in for a good measure.

**We express ourselves** in the way in which we conduct our professional work, e.g. in the style of how we design systems, write code/documentation, or make presentations for different pitches or conferences - this is our craftsmanship part of being one of the "techies."

We also **optimize and power-up** our creations to make them (as it has become a total meme amongst our community) `blazingly fast`, maintainable, cheapest, etc., etc.

But what if we also take a look at the subject of these model people's passion, i.e. the game itself?

## Code-cardstock isomorphism

Okay, I will start with a banger: **Magic: The Gathering has been proven to be Turing complete**. It is literally the title of a 2019 article published by Churchill et al. ([*Magic: The Gathering is Turing Complete*](https://arxiv.org/abs/1904.09828)), inspired by previous work done by Chatterjee et al. in 2016, where it was suggested that [there is a significant computational complexity hiding within the MTG cardboard](https://research-explorer.ista.ac.at/download/478/4658/IST-2018-950-v1%2B1_2016_Chatterjee_The_complexity.pdf).

This article shows them creating a Turing machine using creature tokens (cards that represent creatures or other objects that are generated dynamically by game state effects like spooky zombies being raised from their graves) and other creatures (e.g., Rotlung Reanimator) or sorceries that effectively make the whole game board state a [read-and-write head](https://en.wikipedia.org/wiki/Disk_read-and-write_head).

Then the authors also tackled the hypothesis of their "cardstock-based" machine inheriting the fundamental limitations of computer systems, with the main one being the famous [Halting Problem](https://www.geeksforgeeks.org/theory-of-computation/halting-problem-in-theory-of-computation/) by Alan Turing himself, which can be summarized as follows:

> ***Question:*** Can an algorithm determine whether any given program will halt for a specific input?
>
> ***Answer:*** No. There is no general algorithm that can determine whether every program will halt, which makes the Halting Problem undecidable. It can also be stated as: Given any program (in C, C++, Java, etc.), it is impossible to generally decide whether it will terminate or run indefinitely.
>
> -- GeeksForGeeks *Halting Problem in Theory of Computation*

So, the trick was to recreate this undetermined state using the newly created MTG machine, in which the authors were successful and concluded in their report that:

> This construction establishes that *Magic: The Gathering* is the most computationally complex real-world game known in the literature. In addition to showing that optimal strategic play in Magic is non-computable, it also shows that merely evaluating the deterministic consequences of past moves in Magic is non-computable.
>
> -- Churchill et al. *Magic: The Gathering is Turing Complete*

For those interested, the decklist used during the Alice/Bob simulations presented in the article is shown below. As you can see, each card had its **mechanical purpose** and was chosen to correctly **synergize** with the others, with a goal of starting a correct chain of events that lead to a desired game board state - a sort of **win condition** in the context of the research conducted.

![Card list used in the Turing machine simulation from Churchill et al. article](/assets/images/ucp_mtg_turing.png)

We can safely conclude that Magic (and I guess also other, more robust trading card games in general) can be seen as an abstract system that can be programmed using a dedicated **language in the form of the card rulings**, i.e., prevalent mechanics such as spawning of additional creatures, removal of board state elements, and other effects that players can cause.
Or, more straight to the point ...

### Taking a SOLID look at deckbuilding

The loss function is the number of times you draw sucky cards and/or get your life total reduced to zero - a pretty simple thing to understand when you live to win. Our robust system, which generates silly, aggressive squirrels or reanimates creatures to give them one more chance to shine, must be constructed following the **best practices of clean deckbuilding**.

This art of crafting your own 60 or 100-card weapon of mass destruction is also a great opportunity to reinforce the memory of our wrinkliest muscle in terms of SOLID-ish principles, used every day to create the other highly-efficient systems, i.e., computer software.

#### {S}ingle game plan principle

You cannot build a deck that wins in a series of ways, talking from the [general archetype perspective](https://techraptor.net/tabletop/opinions/competitive-magic-gathering-archetype-introduction). This is pretty much logical, because you cannot efficiently control the state of other players' boards by countering their spells or removing problematic [permanents](https://mtg.fandom.com/wiki/Permanent), **AND** spew out several creatures per turn and reinforce your side of the board.

![Common Magic: The Gathering deck archetypes](/assets/images/ucp_archetypes.png)

This also makes the usual "better safe than sorry" or "just in case" approaches kind of invalid when it comes to designing a well-functioning deck, because each card that does not actively contribute towards predefined win conditions **muddies the pool** and effectively makes the chance of drawing a good hand take a nose dive.

So, if your deck focuses on spamming the opponent with cheap (and wacky) goblins, that are disposable and are often "one-hit wonders", throwing in an expensive, scary dragon will deplete the per-turn allowable resources pretty fast, making the original plan invalid. Play one or two such rounds, and you're "running out of gas".

The unforgiving aspect of going with one strategy consistently is very prevalent in formats such as Pauper. In this mode, You can play 99% of the total card pool of MTG (that is, from 1993 up until now), but there is one restriction: the maximum rarity of cards is common, which are usually the least powerful cards found in decks.

This low-level format incentivizes optimized play and finding cards that cause a chosen type of effect (destroying or buffing creatures, countering spells, drawing cards, etc.) for the lowest amount of mana available. One wrong move may cost you a whole game! Let's take a look at one of the Pauper all-stars - **Dimir Terror**:

![Dimir Terror Pauper decklist screenshot](/assets/images/ucp_dimir_terror.png)

The strategy here is to utilize the **cost reduction** during casting of **powerful creatures** that is fueled by **playing cheap spells and filling up the player's graveyard**. The most famous card in this deck is its namesake: [Tolarian Terror](https://scryfall.com/card/dmu/72/tolarian-terror):

> This spell costs {1} less to cast for each instant and sorcery card in your graveyard.
>
> -- Tolarian Terror's ruling text

So, each card in this deck has one of three possible **single principles**: control the opponent's tempo, control the state of your hand, or "big monster printer go brrrrrr". Terror (not the monster, but the vibes) is actually the **whole deck's responsibility** - to instill a feeling of uncertainty.

Did he draw the scary drake after casting *Brainstorm*, which also would be now one mana cheaper due to this spell going through? Or maybe he has another cheap counter to my next spell? There are no cards that give the deck "adaptability" or "elasticity" in the sense of its win condition. No modal spells. Just **control** and **fuel your engine**.

This singular focus can also be seen in the number of cards that are included: these most crucial "terror generators" are found in multiples of 4. There are **nine** such positions, which nicely follow the so-called ["The Rule of Nine"](https://www.coolstuffinc.com/a/magic-the-classroom-the-rule-of-nine), which can be retroactively used to identify this main strategy of a deck.

Each card **functions** in a strictly limited, defined way. These **functions** feed into the overarching **program** of the deck. Seems clean to me. So, deckbuilding can show us the benefit of using this granular approach, where the system is composed of nicely separated functionalities and doesn't try to do everything at once.

#### {O}verall plan and side plan

Assume that we have the core of our deck in place. We've decided that the collection of chosen cards will work optimally in a vacuum (which we will also go back to in the extra talking points later). Still, the reality is that everybody also has a tailor-made counter to your board domination plan up their sleeve(s). Let's stick with the Dimir Terror deck as our choice.

Now, imagine you are playing against a purely red-coloured deck. This deck likes to play spells and burn down your health. There are some finishing spells within it, like [Fireblast](https://scryfall.com/card/vma/159/fireblast), that can demolish unsuspecting players.

Luckily, the bajillion counterspells at the Dimir decks disposal are a good way of saving these 4 life points, surviving yet another turn, and maybe swinging in you next one for the win. Pauper format is full of such close calls - it is not really unheard of, in fact, it is pretty common nowadays.

So, the opponent plays Fireblast, it gets countered, another try is being made at casting it (due to another copy present in the enemy's hand), but again, the counter is ready to be deployed, and both of the blasts fizzle. Good job!

Okay, round 2 - a similar thing happens. You are at death's door, but you've anticipated that. First blast is fired at your face. Counterspell. Then, another sorcery is being thrown at those 2 health points of yours. Spell Pierce (another counter basically). But then the opponent fires off this bad boy out:

![Red Elemental Blast card image](/assets/images/ucp_red_elemental_blast.png)

GG. Your enemy has a **hotfix**/**extension** of his deck that could be used to quickly adapt to the control deck playstyle and managed to sneak in a win. His **core win condition** of burning down the opponent's health by casting cheap damaging spells was still intact, i.e., **closed**, but the surrounding arsenal of cards that help reach this goal was **open to modification**.

In MTG, this can be done by using a thing called a *sideboard*, which can "patch" a deck to make it adaptable to different conditions. For example, you can take out some creature removal spells when you know it will be hard to deal with them in that way and just add those cheeky counters available in the color of the deck.

This is also how often software architecture is approached. You can have, for example, an ETL pipeline that is fed data that gets processed according to a business logic set in stone, but the system can be extended to support different data sources: cloud storage, local files, event-driven specific services, etc. A nice mix of elasticity and rigidity on different levels of functionality. Openness and closeness.

#### {L}lanowar Substitution Principle

Taking into account our Dimir sheninegans up until this point, we see that one of the important gears of the terror-inducing engine is **card draw**. There are totally uncuttable cards from this deck, such as **Brainstorm**, which is a staple of a lot of Magic decks, but there are some other positions of the decklist that can be modified.

And they can be modified in such a way, that the **overarching system** will function in the same way, because the overall "interface" used to carry out the turns stays the same: we can still either **draw**, **counter**, or **play terrifying creature**.

An example of such a modification would be the [Deep Analysis](https://scryfall.com/card/ema/45/deep-analysis) card used in our version of the Dimir Terror deck. If you search around the web for its stand-ins, another blue, card-drawing spell may catch your attention: [Lórien Revealed](https://www.cardmarket.com/en/Magic/Products/Singles/The-Lord-of-the-Rings-Tales-of-Middle-earth/Lorien-Revealed), which offers a **similar ratio of gained cards to mana** and is also a well-known Pauper staple.

From the point of view of the deck as an overarching system, the swap doesn't remove or limit this pillar of its strategy, so **functionally**, those two cards are identical. The previously mentioned "interface" of Dimir Terror is untouched.

To drive this point even further, look at the two following cards:

![Elvish Mystic and Llanowar Elves card images](/assets/images/ucp_llanowar_mystic.png)

Both are **1 power and 1 toughness** creatures of **common rarity** that can be used to give You **one additional green mana** and cost **1 green mana** to be cast. Even their types are identical: **Elf Druid**. In a deck that cares about elves and generating a constant stream of mana (called "ramping" in MTG lingo), you can use either of them.

This is what I call, in this case, the **Llanowar Substitution Principle**, and this guideline can be used to, for example, look for cheaper, temporary alternatives for Your deck if the original card is hard to get.

How does this relate to software architecture? Substitute **Llanowar** with **Liskov**! Even this operation follows the "L in SOLID" principle - the point of this section stays the same! As with our green mana, elvish **providers**, the overarching interface should be **resilient to changes of its underlying providers** e.g. if our class representing the service **takes data in using the `load` function of some other `DataProvider` type of class** that returns some object with a **pre-determined schema** and then does some magic on it internally, it shouldn't matter if the `DataLoader` fetches this data from a local FTP server or a S3 bucket.

As long as it does its thing and politely returns a piece of information that follows the aforementioned format, it is all good. You can interchange those providers however you want. Just as it doesn't matter if the green mana is coming from an Elvish Mystic or its Llanowar counterpart. But also it goes a little further than just having options at your disposal.

If you create your deck or software architecture in a way that allows for such substitutions, you can get to testing them right away. By either using a cheaper card or a faster to implement and simpler provider, you can see how the **functionality presented by them** works as a part of a larger system. Are those providers synergizing well, or make the architecture janky? Both in Magic's ecosystem and in the tech world, lagging is a crucial indicator that some piece might not "click" as well as we have anticipated.

By having an opportunity to use mocked actors, you can notice it prematurely and decide to go back to the drawing board or not with your initial design.

#### {I}nteractions a-plenty

As you have probably guessed up until now, the situation can change pretty drastically during a normal game of Magic, and we want to be consistent in ways of reacting to such changes. Let's ponder over the following case of us trying to "optimize" the Dimir Terror deck in terms of being able to having a seemingly more chance of countering our opponents' moves:

We've looked through the Scryfall database in hopes of finding a cheap "Counterspell-ish" instant spell that is reminiscent of what we have already in our deck. [Annul](https://www.cardmarket.com/en/Magic/Products/Singles/Kaldheim/Annul)! Of course, we already have a one-mana counter in the form of [Spell Pierce](https://scryfall.com/card/xln/81/spell-pierce), so the idea of more specialized but cheaper control is there. What could go wrong?

Well, compare the number of decks where people can play instant/sorcery spells against the prevalence of artifact/enchantment-focused strategies. What if the opponent doesn't play any artifacts at all? Annul becomes practically **a dead card** - even if it occupies slots in the sideboard, because each copy of it is another, more useful alternative lost. In other words, You **enforce a strict dependency** on specific ways of playing the game that **may happen**.

Instead of using **a general, robust** ["Oops, all counters"](https://magic.wizards.com/en/news/feature/oops-all-spells-2013-11-07) way of interacting with the opponent's moves i.e. "only I can play the game" mode, you can use more specialized approaches of: "don't let them create new stuff" (removal of creatures provided by black color and classic Counterspell usage) and "don't let them kill my stuff" (again Counterspell comes in handy here + Spell Pierce just in case You need something cheaper).

These segregated interfaces make us **less coupled** to what could possibly happen on the board and let us pick our fights more wisely. Taking a step outside the Pauper realm, in [Commander](https://magic.wizards.com/en/formats/commander) format, players are allowed only ONE COPY of a given card per deck, which makes the deck building a little more tricky if we want consistent functionality. However, we also have a pretty generous library of so-called [**modal cards**](https://mtg.fandom.com/wiki/Modal) or [tiered cards](https://draftsim.com/mtg-tiered/) whose effects depend on **how much mana we are willing to pay as their casting cost**. Let's take a look at one of the cards from Final Fantasy crossover set - [Cloud's Limit Break](https://gatherer.wizards.com/FIC/en-us/14/clouds-limit-break):

![Cloud's Limit Break card image](/assets/images/ucp_cloud_limit_break.png)

The more mana we are willing to pay, the more devastating the effects of this card, so even if we draw this card at the final stages of our Commander game, we can bounce back from a difficult situation by destroying a majority of the opponents' boards. But also, we can use it for cheaper when some **big, scary creature** is attacking us, and we want to deal with it **right here and right now**.

Notice that even in the context of a singular card, we can have multiple subinterfaces! Cloud's Limit Break can function either as a one-target removal spell or a weapon of mass destruction.

We want to have a fine-grained separation of such interfaces in our deck so that it can fit into **different stages of the game** or **the system itself can react by its design to different situations**. This nicely translates into the optimal way in which the software architecture is to function in our dynamic environments.

For a little bit of a plot twist, let's imagine that we have a Python application that crudely simulates a Magic: The Gathering player's hand during his turn. For such a system, we need something that represents a single `Card`, because, well, that is what we will be throwing against our opponents. If we ignore the segregation of interfaces, we will end up with a "slop", monolithic class that wants to include every possible aspect of MTG card:

```python
class Card:
    """
    A monolithic base class that forces every card
    to implement methods it might not need.
    """
    def play_as_land(self):
        raise NotImplementedError("This card cannot be played as a land!")

    def cast_as_spell(self):
        raise NotImplementedError("This card cannot be cast as a spell!")

class Island(Card):
    def play_as_land(self):
        print(" -> Playing Island: (+1 Blue Mana)")

    # PROBLEM: Island inherits 'cast_as_spell' but it's useless/dangerous here.

class LightningBolt(Card):
    def cast_as_spell(self):
        print(" -> Casting Lightning Bolt: (Deal 3 damage)")
    # PROBLEM: Lightning Bolt inherits 'play_as_land' but cannot use it.
```

What if we made **distinct interfaces** for FUNDAMENTALLY different land and spell cards? This opens up a lot more possibilities for use and reduces the need to implement useless functions for our concrete cases (as seen above).

```python
from abc import ABC, abstractmethod

# Interface for cards that can be played as a land
class Land(ABC):
    @abstractmethod
    def play_land(self):
        pass

# Interface for cards that can be cast as a spell
class Spell(ABC):
    @property
    @abstractmethod
    def mana_cost(self):
        pass

    @abstractmethod
    def cast_spell(self):
        pass
```

Now, we can properly distinguish, even by the class inheritance itself, what the type of a card is available in the player's hand:

```python
class Island(Land):
    def play_land(self):
        print("🔵 Action: Playing Island (Add Blue Mana)")

class LightningBolt(Spell):
    @property
    def mana_cost(self):
        return 1

    def cast_spell(self):
        print("⚡ Action: Casting Lightning Bolt (Deal 3 damage)")

# Here is the engine for checking the player's hand state

class GameEngine:
    def evaluate_hand(self, hand_of_cards, available_mana):
        print(f"\n--- Player's Turn (Mana available: {available_mana}) ---")

        for card in hand_of_cards:
            card_name = card.__class__.__name__
            print(f"\nChecking card: {card_name}...")

            # Can it be played as a land?
            if isinstance(card, Land):
                print(f"  You can play this as a Land.")

            # Can it be cast as a spell?
            if isinstance(card, Spell):
                if available_mana >= card.mana_cost:
                    print(f"  You can cast this Spell (Cost: {card.mana_cost}).")
                else:
                    print(f"  [INFO] Not enough mana to cast (Cost: {card.mana_cost}).")

# --- Simulation ---

my_hand = ...

engine = GameEngine()
engine.evaluate_hand(my_hand, available_mana=1)
```

Even more, we can do a lot of exotic stuff available in the Magic's arsenal, such as [Modal Double-Faced Cards](https://mtg.fandom.com/wiki/Double-faced_card) that can be played in **two distinct ways** (similar to the previously shown tiered/modal case) by flipping it to either side e.g., [Malakir Rebirth // Malakir Mire](https://scryfall.com/card/znr/111/malakir-rebirth-malakir-mire):

```python
class MalakirRebirth(Spell, Land):
    @property
    def mana_cost(self):
        return 1

    def cast_spell(self):
        print("💀 Action: Casting Malakir Rebirth (Save creature from death)")

    def play_land(self):
        print("⚫ Action: Playing Malakir Mire (Land enters tapped)")
```

More segregation and specialization of different tools at our disposal has made our creation more dynamic and even extensible in the future, which will allow us to win many more battles waiting for us in the future!

#### {D}igging through the options

Okay, let's not beat around the bush now - how can we find the dependency injection principle in the world of Magic: The Gathering deckbuilding and not stretch too far with this gymnastics of the mental kind?

Well, you would be surprised, but there is a very nice tactic used by MTG homebrewers (people who cook up those crazy decks) that brings consistency to their creations: [**tutoring**](https://mtg.fandom.com/wiki/Tutor). The name has its roots in the signpost card that shows us the functionality of game pieces that would be included in a nicely structured deck - the one and only [Demonic Tutor](https://scryfall.com/card/uma/93/demonic-tutor):

> Search your library for a card, put that card into your hand, then shuffle.
>
> -- The holy scripture engraved onto each copy of the Demonic Tutor

Now, this makes for a pretty nice generalization in the strategy presented by any deck that uses a black-coloured mana. There are a lot of cases when we would **really, really like** to have a card that is an essential **combo piece** or a **game finisher** at our disposal. Without tutoring, we would need to somehow dig through all of the library to find that one specific **THE BE-ALL AND END-ALL SILVER BULLET**, and then also deal with the problem of most of our cards lying in our discarded cards pile by either shuffling the back to our deck or just accepting that fact to continue playing with greatly diminished resources.

Or we could just put a couple of tutors in the same library, which would allow us to pick **one of the possible responses** to the current game state, each of which creates a nice crossroad of valid strategies. What if we want to switch one win condition with another? Just cut out the cards specific to the original, unneeded game plan and put the new one for which you will also be able to tutor!

By doing so, you have successfully **moved your dependency on specific game-winning cards** to a group of cards that can *provide* (keyword here!) You **with more general functionality of grabbing such crucial pieces from your deck**. Tutor is a **provider** of a way to access our strategies in a more consistent and **interchangeable** way. Nothing stops you from switching the tutors to a less efficient **card-drawing spell - sometimes the price of tutors themselves may force a player to do so:

![Demonic Tutor card listing found on Amazon](/assets/images/ucp_demonic_tutor_amazon.png)

If you want to dig **EVEN DEEPER** into this line of thought, there are also **card-type-specific tutors** like [Enlightened Tutor](https://scryfall.com/card/dmr/6/enlightened-tutor) that follow the general tutoring mechanic, but grab only enchantments from it. The tutor-like card design **defines a type of functionality**, and the concrete cards **implement it**, by looking for their chosen flavor of the cardstock.

Now, going to the wonderful realm of bytes and bugs, the dependency injection principle is similar. Let's imagine that we want to introduce it into our super high-tech MTG game simulation engine shown in the previous [ISP](https://en.wikipedia.org/wiki/Interface_segregation_principle) section: Instead of letting the `GameEngine` randomly rely on a specific, hard-coded deck, we **inject** a specific source of cards.

For this purpose, we can define a **general provider of cards for our engine**:

```python
import random
from abc import ABC, abstractmethod

# The GameEngine needs cards, but it shouldn't care WHERE they come from.
# It shouldn't depend on a concrete "Deck" class, but on an abstract "Source".

class CardSource(ABC):
    @abstractmethod
    def draw_card(self):
        pass
```

This allows us to swap between a real shuffled deck and a stacked one (here, *stacked* means that it has been arranged dishonestly to gain an unfair advantage). We can treat a tutor as an edge case of a stacked deck that returns to us a chosen game piece we need. Such a change can be done without changing the engine code itself:

```python
class ShuffledLibrary(CardSource):
    def __init__(self, deck_list):
        self._deck = deck_list
        random.shuffle(self._deck)

    def draw_card(self):
        if self._deck:
            return self._deck.pop(0)
        return None

# This represents using a Tutor to find the exact card you need.
# In programming, this is often used for Unit Testing (Mocking).
class DemonicTutorSource(CardSource):
    def __init__(self, specific_cards):
        # We control the exact order (First In, First Out)
        self._stacked_deck = specific_cards

    def draw_card(self):
        if self._stacked_deck:
            print("  (👻 Demonic Tutor effect: Fetching specific card...)")
            return self._stacked_deck.pop(0)
        return None
```

By doing so, we can simulate using a tutor or just not having one, by adding the card drawing functionality as such:

```python
class GameEngine:
    # ✅ DEPENDENCY INJECTION:
    # We ask for an ICardSource in the constructor.
    # We do NOT create 'new ShuffledLibrary()' inside here.
    def __init__(self, card_source: CardSource):
        self.source = card_source
        self.hand = []

    def start_turn(self):
        print("--- STARTING TURN ---")
        print("Draw Step...")

        new_card = self.source.draw_card()

        if new_card:
            self.hand.append(new_card)
            print(f"drawn: {new_card.__class__.__name__}")
            # (Here we would use the logic from the previous example to check actions)
        else:
         # If a player does not have cards in his library, he automatically loses
            print("❌ Empty Library! You lose.")
```

We can see that it doesn't matter what library is used in the game engine - the overarching mechanisms stay the same as long as this stack of cards follows the general "interface" of letting us draw from it. Do you want to, for some totally exotic and MTG rules-violating reason, have a library that shuffles itself after each card draw? Modify the `draw_card` method of the specific `CardSource` implementation.

Who knows, maybe in the future there will be a card that enforces such an effect - then it will be just a matter of swapping the usual `ShuffledLibrary` with `ConstantlyReshufflingLibrary` or something like that. For now, the case of tutoring nicely shows us that **functionality can be an interchangeable logic unit**, to be **injected** at different places in the architecture and **communicated with via a generally defined interface**.

## Footprints

Before wrapping up all of these analogies between guidelines for deckbuilding and designing software architecture, I would also like to point out some elements of the MTG mechanics that make it a more obvious "language" in which we can scheme out our interactions with various board states i.e., inputs for our decisions.

These are less general concepts, so naturally they have more concrete programming counterparts.

### "In response..."

Computer systems can have different ways of queueing up instructions to carry out, both on a level much closer to the bare metal architecture pieces like RAM and elements for general control logic, but also on a much abstract level, such as message buses used in event-driven architectures.

One of them is a way of staging these actions in a LIFO manner, meaning "last in, first out", so a task scheduled at the last moment becomes the first one to be executed. The same situation can happen during an usual Magic: The Gathering round, due to different **speeds at which a spell can be cast** or **abilities of already played creatures/artifacts can be used**. In short, there are two of them: **sorcery** and **instant**, with the main difference being WHEN you can use them.

Sorcery spells can be cast only on one of the main phases of **your turn**, and nowhere else. However, opponents then have a chance to **react in response to your play** using one of the cards or abilities that are of the **instant** kind, due to the notion of **priority** that can shift around the table after each action. When you cast the spell, it becomes the first one to reside on THE STACK.

Then, each subsequent interaction with that play gets layered on top of it, so, for example, another player can cast the aforementioned Counterspell and target the spell you want to resolve successfully. Then, the stack is "executed" in LIFO manner, so whatever you wanted to play doesn't go through. If somebody at the table (in format with 2+ players like Commander) or you wouldn't like that Counterspell to resolve, another spell could be added to the queue, like Spell Pierce aimed at the counter.

In a lot of situations, when I was explaining this concept to somebody, and I got to know that the other person is a more IT systems inclined individual, I could just say: "It is basically a LIFO queue". And it always worked like a charm. Another good one is: "Kafka with the `latest` option set for the automatic offset setting" (`auto.offset.reset`).

What benefit does mastering or constantly analyzing the MTG interactions stack bring to a programmer? Well, this skill can also be useful when you are digging into the real-world **call stack**, because the same breadcrumbs following of "what will happen when this goes through, and then the other request will get interrupted," etc., is prevalent in debugging flaky applications.

### "Minimum 5 years of experience in manual goldfishing"

What is a sign of a good programmer who has lived through his fair share of deployments dying all of a sudden and critical bugfixes being thrown at them? **Extension of the principle of limited trust to himself**. That's what tests are for, and I think it is a well-known truth in the programming landscape in the year of 2026, so I won't elaborate much on why they are useful and what constitutes a good testing suite. If you are curious, just grab yourself an [O'Reilly book about TDD in a chosen language](https://www.oreilly.com/search/?q=TDD&type=book&rows=100) - that's always a good starting point.

The other side of testing, different from the static tests lying in your source code, can be much more empirical, e.g., stress tests, that try to recreate harsh, real-world conditions that the final application will be subjected to. A nice example is APIs, which can be subjected to huge batches of requests being fired at them in an unrelenting manner to check if they can be plugged nicely into the target architecture without becoming a bottleneck for everything else there.

In MTG deckbuilding, both of these aspects can be utilized **to great success** after you cobble up the first "MVP" of the deck with which you will dominate the next Commander session at the local game store. For testing in a controlled environment from the point of view of the raw functionality the deck has to provide, "playing against a pet goldfish" or, in short, **goldfishing** is the go-to tool.

To goldfish a MTG deck is to deal out a starting hand, set up your life total to the appropriate amount for the format that will be played, and simulate turns against an invisible opponent. In this way, you can check how the design of [the mana curve](https://mtg.fandom.com/wiki/Mana_curve) (how likely it is to optimally utilize each turn's mana by being able to draw and cast spells of increasing mana cost, **AND** having this resource available) or which combos in the deck are easiest to consistently pull off.

Most of the major sites used for organizing a player's Magic collection and creating new decks have a goldfishing tool at their disposal, such as [Archidekt's *Playtest* tool](https://archidekt.com/news/3417345), seen in the screenshot below.

![Archidekt's Playtest tool screenshot](/assets/images/ucp_archidekt_playtest.png)

After being satisfied with the initial "unit and integration tests" of the new deck, you can move to playing against different types of MTG archetypes, e.g., a *mill* deck, a *reanimator* deck, an *aggro* deck, etc., to test how it can stand against the threats they pose or if they can keep up or react to their tempos. Accepting the fact that this initial, beta version of the deck will 100% have holes to patch up and win conditions to polish up, could lead to coming up with some nice upgrades for it, by cutting out the less useful cards from the library.

This "manual testing" of each new deck is an experience on its own - gathering the statistical data on how well it behaves, first in a vacuum and then during real games of Magic, is a game of its own, which makes the deckbuilding a very investing activity in trading card games as a whole and for some players it can be even the only thing they choose to do. These homebrewers take pride in the concoctions they bring to the game's ecosystem - just like a programmer can be proud if an architecture where all cogs are turning nicely, with users happily throwing money at their service.

## Enough playing around

If you want, you can go even deeper into conditional loops glued together from pieces of cardstock or some other logical constructs lying in the fine print of the cards. The common thread of this article can be summed up with the following statement: **deckbuilding is physical programming** with **card text using a set language for us to build new behaviors and strategies**.

In my opinion, this is the main factor that makes the STEM people, and IT professionals specifically, gravitate towards trading card games, because a lot of their intrinsic properties make them feel at home. Seeing also how similar activities shown in the article can be, I would also pose the hypothesis that **taking part in one of them, e.g., building a novel MTG deck, tickles the same parts of their brains as writing new, clean pieces of code**, so you can still reinforce the same "muscles" by just chilling with your friends during Friday Night Magic sessions, throwing cards around, rolling dice and proudly presenting that janky decklist with funny goblins from Magic's history, which swarms everybody with these chaotic, little bastards.

And that is also, my dear readers, how I have justified my hobby of sitting hunched over my MTG collection, trying to fish out that one last copy of [Sneaky Snacker](https://scryfall.com/card/mh3/205/sneaky-snacker) for [my beautiful Pauper Madness deck](https://archidekt.com/decks/17192868/madness). Thank you very much for reading, and see you next time, when I will try to do the same with other activities of the geeky kind that I have.

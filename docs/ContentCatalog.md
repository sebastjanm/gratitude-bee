# Gratitude Bee - Content Catalog

This document catalogs all the predefined content, categories, and messages used within the Gratitude Bee application. It serves as a central repository for content strategy and future feature development.

---

## 1. Appreciation Modal Content

The Appreciation Modal is where users can select and send positive badges to their partner.

### 1.1. Appreciation Categories

| Category ID | Name      | Description                                |
| :---------- | :-------- | :----------------------------------------- |
| `support`   | Support   | Recognizing effort and encouragement.      |
| `kindness`  | Kindness  | Appreciating thoughtful and gentle actions.|
| `humor`     | Humor     | Celebrating moments of joy and laughter.   |
| `adventure` | Adventure | Honoring shared experiences and discoveries.|
| `words`     | Love Notes| For words of affirmation and sweet texts.  |

### 1.2. Appreciation Badges

Each badge has a predefined push notification message.

#### Support Badges
| Badge ID          | Title              | Description                                  | BeeCount | Notification Text                                         |
| :---------------- | :----------------- | :------------------------------------------- | :------- | :-------------------------------------------------------- |
| `amazing-work`    | Amazing Work       | Recognizing exceptional effort and dedication| 3        | "sent you an 'Amazing Work' badge!"                       |
| `you-are-best`    | You Are The Best   | Ultimate appreciation for being incredible   | 5        | "thinks you are the best!"                                |
| `believe-in-you`  | I Believe In You   | Encouraging during challenging times         | 2        | "wants you to know they believe in you!"                  |
| `proud-of-you`    | So Proud Of You    | Celebrating achievements and milestones      | 4        | "is so proud of you!"                                     |

#### Kindness Badges
| Badge ID           | Title                   | Description                          | BeeCount | Notification Text                                         |
| :----------------- | :---------------------- | :----------------------------------- | :------- | :-------------------------------------------------------- |
| `thank-you-much`   | Thank You Very Much     | Deep gratitude for thoughtful actions| 1        | "is very thankful for you!"                               |
| `thanks-coffee`    | Thanks For Coffee       | Appreciating morning thoughtfulness  | 2        | "is thankful for the coffee!"                             |
| `gentle-heart`     | Your Gentle Heart       | Recognizing natural compassion       | 3        | "appreciates your gentle heart."                          |
| `caring-soul`      | Beautiful Caring Soul   | Honoring deep empathy and care       | 4        | "thinks you have a beautiful, caring soul."               |

#### Humor Badges
| Badge ID            | Title                 | Description                             | BeeCount | Notification Text                                         |
| :------------------ | :-------------------- | :-------------------------------------- | :------- | :-------------------------------------------------------- |
| `lol`               | LOL                   | Simple moment of laughter               | 1        | "thought that was hilarious!"                             |
| `rofl`              | ROFL                  | Rolling on the floor laughing           | 3        | "is rolling on the floor laughing!"                       |
| `made-me-laugh`     | Made Me Laugh         | Bringing joy with perfect timing        | 2        | "is still laughing about that."                           |
| `silly-dance`       | Silly Dance Master    | Spontaneous moments of pure fun         | 3        | "loved your silly dance!"                                 |
| `comedy-genius`     | Comedy Genius         | Natural talent for making others smile  | 4        | "thinks you're a comedy genius."                          |
| `brightened-day`    | Brightened My Day     | Turning ordinary moments into joy       | 3        | "wanted to say you brightened their day."                 |

#### Adventure Badges
| Badge ID             | Title                    | Description                          | BeeCount | Notification Text                                         |
| :------------------- | :----------------------- | :----------------------------------- | :------- | :-------------------------------------------------------- |
| `sunset-walk`        | Perfect Sunset Walk      | Creating magical shared moments      | 3        | "loved that sunset walk with you."                        |
| `new-place`          | Found New Place          | Discovering hidden gems together     | 4        | "is excited about the new place you found."               |
| `spontaneous-trip`   | Spontaneous Adventure    | Embracing unexpected journeys        | 5        | "is still thinking about your spontaneous adventure."     |
| `nature-lover`       | Nature Connection        | Sharing love for the outdoors        | 2        | "appreciates your connection with nature."                |

#### Love Notes Badges
| Badge ID              | Title                    | Description                          | BeeCount | Notification Text                                         |
| :-------------------- | :----------------------- | :----------------------------------- | :------- | :-------------------------------------------------------- |
| `you-are-everything`  | You Are My Everything    | Complete devotion and love           | 3        | "wants you to know you're their everything."              |
| `thinking-of-you`     | Thinking Of You          | Constant presence in thoughts        | 1        | "is thinking of you."                                     |
| `sweet-message`       | Sweet Message            | Perfect words at the right time      | 2        | "loved your sweet message."                               |
| `morning-text`        | Beautiful Morning Text   | Starting the day with love           | 3        | "is smiling because of your morning text."                |
| `love-letter`         | Heartfelt Love Letter    | Deep emotional expression            | 5        | "is touched by your heartfelt letter."                    |
| `encouraging-words`   | Encouraging Words        | Lifting spirits with kindness        | 3        | "is grateful for your encouraging words."                 |

---

## 2. Favors Modal Content

The Favors Modal allows users to request help from their partner using a point-based system.

### 2.1. Favor Categories

| Category ID | Name           |
| :---------- | :------------- |
| `all`       | All Favors     |
| `food`      | Food & Drinks  |
| `errands`   | Errands        |
| `help`      | Home Help      |
| `treats`    | Treats         |

### 2.2. Predefined Favors

#### Food & Drinks
| Favor ID       | Title                   | Description                                    | Points |
| :------------- | :---------------------- | :--------------------------------------------- | :----- |
| `bring-coffee` | Bring Me Coffee         | A perfect cup of coffee, just the way I like it| 5      |
| `cook-dinner`  | Cook Dinner Tonight     | Surprise me with a delicious home-cooked meal  | 15     |
| `order-food`   | Order My Favorite Food  | I'm craving something special, please order it | 10     |

#### Errands & Shopping
| Favor ID             | Title                 | Description                                | Points |
| :------------------- | :-------------------- | :----------------------------------------- | :----- |
| `grocery-shopping`   | Go Grocery Shopping   | Pick up groceries from our shopping list   | 12     |
| `pick-me-up`         | Pick Me Up            | Come get me from this location             | 8      |
| `run-errand`         | Run a Quick Errand    | Help me with a small task or errand        | 7      |

#### Home Help
| Favor ID             | Title               | Description                             | Points |
| :------------------- | :------------------ | :-------------------------------------- | :----- |
| `clean-kitchen`      | Clean the Kitchen   | Take care of the dishes and tidy up     | 10     |
| `help-with-chores`   | Help with Chores    | Lend a hand with household tasks        | 8      |

#### Treats & Special
| Favor ID           | Title                      | Description                              | Points |
| :----------------- | :------------------------- | :--------------------------------------- | :----- |
| `ice-cream`        | Bring Me Ice Cream         | I need something sweet and cold          | 6      |
| `surprise-treat`   | Surprise Me with a Treat   | Something special to brighten my day     | 12     |

---

## 3. Hornet (Negative Badge) Modal Content

The Hornet Modal is for accountability and addressing issues.

| Hornet ID                  | Title                      | Description                                | Severity | Points |
| :------------------------- | :------------------------- | :----------------------------------------- | :------- | :----- |
| `light-misunderstanding`   | Light Misunderstanding     | Minor issue that needs gentle addressing     | light    | -10    |
| `not-ok`                   | Hey, This Is Not OK        | Significant concern that requires attention  | medium   | -50    |
| `clusterfuck`              | Clusterfuck                | Major issue requiring serious discussion     | heavy    | -100   |

---

## 4. Don't Panic Modal Content

This modal provides messages of comfort and reassurance. The notification text is the message itself.

### 4.1. Panic Triggers (Informational Icons)

| Text              |
| :---------------- |
| Stressful call    |
| Jobs situation    |
| Anxiety moment    |

### 4.2. Calming Messages

| Message ID          | Title                     | Message                                                     |
| :------------------ | :------------------------ | :---------------------------------------------------------- |
| `everything-okay`   | Everything Will Be Okay   | Everything will be okay ❤️ Take a deep breath             |
| `here-for-you`      | I'm Here For You          | I'm here for you, always. You're not alone in this ❤️     |
| `deep-breath`       | Take a Deep Breath        | Take a deep breath with me. In... and out... You've got this 💙 |
| `youre-safe`        | You're Safe Now           | You're safe now, I love you. This feeling will pass ❤️    |
| `talk-when-ready`   | Let's Talk When Ready     | Let's talk when you're ready. No pressure, just love 💕     |
| `calm-energy`       | Sending Calm Energy       | Sending you all my calm energy and peaceful vibes 🕊️✨     |

---

## 5. Relationship Wisdom Modal Content

This modal offers non-confrontational responses for common situations. These events carry **no point value**. The notification text is the title of the wisdom.

| Wisdom ID                 | Title                        | Description                                     |
| :------------------------ | :--------------------------- | :---------------------------------------------- |
| `whatever-you-say`        | Whatever You Say, So Be It   | Graceful acceptance of your perspective and wisdom|
| `yes-dear`                | Yes, Dear                    | Wise partnership acknowledgment and agreement   |
| `happy-wife-happy-life`   | Happy Wife, Happy Life       | Understanding relationship priorities and harmony |
| `im-sorry`                | I'm Sorry                    | Sincere apology and commitment to making amends   |

---

## 6. Ping Modal Content

This modal is for sending urgent but simple nudges. A small point value (e.g., 1 point) is awarded to the receiver upon responding. The notification text is the title of the ping.

| Ping ID         | Title                   | Description                                          |
| :-------------- | :---------------------- | :--------------------------------------------------- |
| `checking-in`   | Just checking in        | A gentle nudge to see how you are.                   |
| `worried`       | A bit worried           | Please text back when you get a chance.              |
| `urgent`        | URGENT: Are you safe?   | Please let me know you are okay as soon as possible. |
| `hornet-alert`  | Hornet Alert            | This is the final warning. A storm is coming.        | 
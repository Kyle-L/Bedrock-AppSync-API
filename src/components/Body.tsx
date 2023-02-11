import { motion } from 'framer-motion';
import DateCard from './DateCard';

export default function Body() {
  const initial = { height: 0, opacity: 0 };
  const animate = { height: 'auto', opacity: 1 };
  const transition = { delay: 4, type: 'spring', stiffness: 25, damping: 10 };

  const dates = [
    {
      real: {
        title: 'Sex Shop Date',
        description:
          'Admittedly that title feels a bit slovenly but anyway, for this impromptu date, we will either go to a physical sex shop or shop online and purchase a sex toy for the other (the former preferred).<br/><br/>After that, we will set the mood and enage in some play time with the new toys.'
      },
      mystery: {
        title: 'Impromptu Date',
        description:
          'This impromptu date only a few minutes to plan and can be done at any time of the day.'
      },
      tags: [
        { title: 'sex-related', color: 'bg-red-200' },
        { title: 'price: < $30', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Shibari Learning',
        description:
          "I feel like we keep talking about this and really haven't gotten around to actually doing it, so why not make it a date?<br /><br />In this date experience, we will grab a guide or YouTube video to some simple Shibari ties. Then we will take turns tying the other up and learning how to do the tie."
      },
      mystery: {
        title: 'Impromptu Date',
        description:
          'This impromptu date only a few minutes to plan and can be done at any time of the day.'
      },
      tags: [
        { title: 'sex-related', color: 'bg-red-200' },
        { title: 'price: n/a', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Otherworld Date',
        description:
          'I am not really sure how we have not done this yet, but we should go to Otherworld!<br /><br />I was thinking we could pick an evening to dress up and go check the place out and look at fun immersive art exhibits.'
      },
      mystery: {
        title: 'Planned Alternative Art Date',
        description: 'This planned immersive art date requires being planned a few days in advance.'
      },
      tags: [
        { title: 'art-related', color: 'bg-blue-200' },
        { title: 'price: $25', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Topiary Park',
        description:
          'The Topiary Park is a small park in the middle of the city that is filled with topiary sculptures. It is a great place to go for a walk, enjoy the art, and have a nice little picnic.<br /><br />I was thinking it would be fun to go there and have a picnic, take some cute pictures, and then go to a nearby coffee shop for a drink.'
      },
      mystery: {
        title: 'Impromptu Art Date',
        description:
          'This impromptu art date requires only requires good weather in the morning/afternoon.'
      },
      tags: [
        { title: 'art-related', color: 'bg-blue-200' },
        { title: 'price: n/a', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Columbus Museum of Art',
        description:
          'We keep talking about going to the Columbus Museum of Art, so why not make it a date?<br /><br />In this date experience, we will go to the Columbus Museum of Art and walk around the museum. They also have a cafe, so we can grab a drink and a snack there.'
      },
      mystery: {
        title: 'Impromptu Art Date',
        description:
          'This impromptu art date can only be done before 5:00pm and cannot be done on Monday.'
      },
      tags: [
        { title: 'art-related', color: 'bg-blue-200' },
        { title: 'price: $18', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Couples Massage',
        description:
          'I have been wanting to try a couples massage for a while now and I would really really like to do it with you!<br /><br />I am not sure this date needs a description but rather just committing to a time to do it.'
      },
      mystery: {
        title: 'Planned Relaxation Date',
        description:
          'This planned relaxation date requires being planned a few days/week in advance.'
      },
      tags: [
        { title: 'relaxation', color: 'bg-blue-200' },
        { title: 'price: $100', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Cooking Class',
        description:
          'Columbus has a rather exceptional amount of cooking classes in the area from those in Worthington/Duplin/Short North.<br /><br />I would very much enjoy picking one and learning to cook a new dish together while improving our cooking prowess.'
      },
      mystery: {
        title: 'Planned Food/Culture Date',
        description:
          'This planned food/culture date requires being planned a few days/week in advance.'
      },
      tags: [
        { title: 'food/culture', color: 'bg-blue-200' },
        { title: 'price: $100', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Comedy Show',
        description:
          'I think a fun and entertaining date would be to go to a comedy show together.<br /><br />There are quite a few comedy shows in the area at places like the Funny Bone, the Columbus Athenaeum, and the Lincoln Theatre.'
      },
      mystery: {
        title: 'Planned Culture Date',
        description: 'This planned culture date requires being planned a few days/week in advance.'
      },
      tags: [
        { title: 'culture', color: 'bg-blue-200' },
        { title: 'price: < $50', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Ice Skating',
        description:
          'I recently learned that there is an ice skating rink near OSU and I would love to go ice skating with you!<br /><br />Their times are a bit finicky, but I think we could make it work if we planned it out a bit.'
      },
      mystery: {
        title: 'Planned Physical Activity Date',
        description:
          'This planned physical activity date requires being planned a few days/week in advance due to weird scheduling.'
      },
      tags: [
        { title: 'physical activity', color: 'bg-blue-200' },
        { title: 'price: $15', color: 'bg-green-200' }
      ]
    },
    {
      real: {
        title: 'Buy a Plant for the Other',
        description:
          'I have been wanting to buy a plant for you for a while now and I think it would be a nice gesture to do so. Then I thought fun date idea would be to go to a plant store and pick out a plant for the other person.<br /><br />I pick a plant for you and you pick a plant for me. Then we can go home and plant them and take care of them together.'
      },
      mystery: {
        title: 'Impromptu Misc Date',
        description:
          'This impromptu misc date can be done at any time of the day, though it would be best if it was done in the morning/afternoon.'
      },
      tags: [
        { title: 'plant-related', color: 'bg-blue-200' },
        { title: 'price: < $30', color: 'bg-green-200' }
      ]
    }
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 overflow-hidden"
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <div className="text-white text-center">
        <p className="text-xl">A selection of mystery date ideas!</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {dates
          .sort((date1, date2) => date1.mystery.title.localeCompare(date2.mystery.title))
          .map((date, i) => (
            <motion.div
              key={i}
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 4 + i * 0.2, type: 'spring', stiffness: 25, damping: 10 }}
            >
              <DateCard date={date} />
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}

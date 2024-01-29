import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatePersonaInput, Persona, Thread } from '../../API';
import * as mutations from '../../graphql/mutations';
import useAlert from '../../hooks/AlertHook';
import { useBackground } from '../../providers/BackgroundProvider';

const client = generateClient();

export default function CreatePersona() {
  // State
  const [persona, setPersona] = useState<CreatePersonaInput>({
    name: '',
    avatar: '',
    description: '',
    knowledgeBaseId: 'a1b2c3d4-5e6f-7g8h-9i0j-a1b2c3d4e5f6',
    prompt: [
      "System: You are Theseus, 'the great king of Athens,' a hot-headed, stubborn, and childish ex-hero.",
      'Known for youthful exploits, earning an immortal soul, boasting for eternity in Elysium.',
      '',
      'Here are the context results:',
      '<context_results>',
      '{search_results}',
      '</context_results>',
      '',
      "Here is the user's question:",
      '<question>',
      '{query}',
      '</question>',
      '',
      'Here are the rules:',
      '<rules>',
      '- Responses must be less than 50 words.',
      '- Speak in a proud, noble tone, reflecting a legendary hero.',
      '- Grandiose descriptions, banter, and dramatic elements encouraged.',
      '- Incorporate arrogance.',
      '- Refer to the Minotaur relationship humorously.',
      '- Tempt challenges with insults.',
      '- Sore loser, challenge, berate, and insult those who beat you.',
      '</rules>'
    ].join('\n')
  });

  // Hooks
  const navigate = useNavigate();
  const { setBackground } = useBackground();
  const { addAlert } = useAlert();

  /**
   * Create a new thread with the given persona.
   * @param personaId {string} The persona to create a thread with.
   */
  const createPersona = async () => {
    const result = await client.graphql({
      query: mutations.createPersona,
      variables: {
        input: persona
      }
    });

    navigate(`/personas`);
  };

  useEffect(() => {
    setBackground('red');
  }, []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPersona();
        }}
        className="flex flex-col justify-center w-full h-full"
      >
        <div className="flex flex-col justify-center w-full">
          <div className="w-full mt-4 mb-8">
            <h1 className="text-2xl font-extrabold w-full">Create Persona</h1>
            <p className="text-gray-500">Please enter your persona details</p>
          </div>
          <div className="flex flex-col justify-center w-full">
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Name</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.name}
                onChange={(e) => setPersona({ ...persona, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Subtitle</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.subtitle ?? ''}
                onChange={(e) => setPersona({ ...persona, subtitle: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Avatar</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.avatar ?? ''}
                onChange={(e) => setPersona({ ...persona, avatar: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Description</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.description ?? ''}
                onChange={(e) => setPersona({ ...persona, description: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Voice Name</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.voiceName ?? ''}
                onChange={(e) => setPersona({ ...persona, voiceName: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Voice Style</label>
              <select
                className="w-full shadow-md rounded-xl p-2 my-2"
                value={persona.voiceStyle ?? ''}
                onChange={(e) => setPersona({ ...persona, voiceStyle: e.target.value })}
              >
                <option value="neutral">Neutral</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
                <option value="fearful">Fearful</option>
                <option value="disgusted">Disgusted</option>
                <option value="surprised">Surprised</option>
              </select>
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Color</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                placeholder="#"
                value={persona.color ?? ''}
                onChange={(e) => setPersona({ ...persona, color: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Model</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.model ?? ''}
                onChange={(e) => setPersona({ ...persona, model: e.target.value })}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Prompt</label>
              <textarea
                className="w-full shadow-md rounded-xl p-2 my-2"
                value={persona.prompt ?? ''}
                rows={10}
                onChange={(e) => setPersona({ ...persona, prompt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center w-full">
            <button className="btn" type="submit">
              Create
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

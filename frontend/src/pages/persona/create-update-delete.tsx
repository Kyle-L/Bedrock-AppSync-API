import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatePersonaInput, Persona, UpdatePersonaInput } from '../../API';
import * as mutations from '../../graphql/mutations';
import * as queries from '../../graphql/queries';
import useAlert from '../../hooks/AlertHook';
import { useBackground } from '../../providers/BackgroundProvider';
import { gradientColorMap } from '../../components/gradient-dict';

const client = generateClient();

export default function CreateEditDeletePersona() {
  // State
  const [persona, setPersona] = useState<CreatePersonaInput | UpdatePersonaInput>({
    name: '',
    avatar: '',
    description: '',
    knowledgeBaseId: null,
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
  const { personaId } = useParams();
  const navigate = useNavigate();
  const { setBackground } = useBackground();
  const { addAlert } = useAlert();

  /**
   * Create a new persona with the given persona.
   * @param persona {UpdatePersonaInput}
   * @returns {Promise<void>}
   */
  const createPersona = async (persona: CreatePersonaInput) => {
    try {
      const result = await client.graphql({
        query: mutations.createPersona,
        variables: {
          input: persona
        }
      });
  
      addAlert('Persona created', 'success');
      navigate(`/personas/update/${result.data.createPersona.persona?.personaId}`);
    } catch (err: any) {
      addAlert(err?.message ?? 'Something went wrong', 'error');
    }
  }

  /**
   * Update a persona with the given persona.
   * @param persona {UpdatePersonaInput}
   * @returns {Promise<void>}
   */
  const updatePersona = async (persona: UpdatePersonaInput) => {
    try {
      const result = await client.graphql({
        query: mutations.updatePersona,
        variables: {
          input: persona
        }
      });

      addAlert('Persona updated', 'success');
    } catch (err: any) {
      addAlert(err?.message ?? 'Something went wrong', 'error');
    }
  }

  /**
   * Delete a persona with the given personaId.
   * @param personaId {string} The personaId to delete.
   */
  const deletePersona = async () => {
    if (!personaId) {
      addAlert('Persona not found', 'error');
      return;
    }

    try {
      const result = await client.graphql({
        query: mutations.deletePersona,
        variables: {
          input: {
            personaId: personaId
          }
        }
      });
  
      addAlert('Persona deleted', 'success');
      navigate(`/personas`);
    } catch (err: any) {
      addAlert(err?.message ?? 'Something went wrong', 'error');
    }
  };

  // Sets the background color to selected persona color.
  useEffect(() => {
    setBackground(persona.color ?? 'rose');
  }, [persona]);

  useEffect(() => {
    if (!personaId) {
      return;
    }

    // Load Persona data
    client
      .graphql({ query: queries.getPersona, variables: { input: { personaId } } })
      .then(({ data }) => {
        if (!data.getPersona) {
          addAlert('Persona not found', 'error');
          return;
        }

        setPersona({
          name: data.getPersona.name,
          avatar: data.getPersona.avatar,
          description: data.getPersona.description,
          knowledgeBaseId: data.getPersona.knowledgeBaseId,
          prompt: data.getPersona.prompt,
          subtitle: data.getPersona.subtitle,
          voice: data.getPersona.voice ? {
            name: data.getPersona.voice.name,
            style: data.getPersona.voice.style
          } : undefined,
          color: data.getPersona.color,
          model: data.getPersona.model,
          personaId: data.getPersona.personaId 
        });
        console.log('data: ', data.getPersona);
      })
      .catch((err) => {
        addAlert(err?.message ?? 'Something went wrong', 'error');
      });
  }, [personaId]);

  return (
    <div className="flex flex-col justify-center w-full">
      {persona && (
        <div className="flex flex-col justify-center w-full h-full">
          <div className="w-full mt-4 mb-8">
            <h1 className="text-2xl font-extrabold w-full">{personaId ? 'Update' : 'Create'} Persona</h1>
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
              <label className="text-slate-500">Knowledge Base ID</label>
              <input
                className="w-full shadow-md rounded-xl p-2 my-2"
                type="text"
                value={persona.knowledgeBaseId ?? ''}
                onChange={(e) => setPersona({ ...persona, knowledgeBaseId: e.target.value ?? null })}
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
                value={persona.voice?.name ?? ''}
                onChange={(e) =>
                  setPersona({ ...persona, voice: { ...persona.voice, name: e.target.value } })
                }
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Voice Style</label>
              <select
                className="w-full shadow-md rounded-xl p-2 my-2"
                value={persona.voice?.style ?? ''}
                onChange={(e) =>
                  setPersona({ ...persona, voice: { ...persona.voice!, style: e.target.value } })
                }
              >
                <option value="neutral">Neutral</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
                <option value="fearful">Fearful</option>
                <option value="disgusted">Disgusted</option>
                <option value="surprised">Surprised</option>
                <option value="whispering">Whispering</option>
                <option value="shouting">Shouting</option>
                <option value="cheerful">Cheerful</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
            <div className="flex flex-col justify-center w-full">
              <label className="text-slate-500">Color</label>
              <select 
                className="w-full shadow-md rounded-xl p-2 my-2"
                value={persona.color ?? ''}
                onChange={(e) => setPersona({ ...persona, color: e.target.value })}
              >
                {gradientColorMap && Object.keys(gradientColorMap).sort().map((color) => (
                  <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                ))}
              </select>
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
          <div className="flex flex-row ml-auto space-x-2">
            {personaId ? (<>
              <button className="btn-secondary" onClick={deletePersona}>
                Delete
              </button>
              <button className="btn" onClick={() => updatePersona(persona as UpdatePersonaInput)}>
                Update
              </button>
            </>
            ) : (

              <button className="btn" onClick={() => createPersona(persona as CreatePersonaInput)}>
                Create
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

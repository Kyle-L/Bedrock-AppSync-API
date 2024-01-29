import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Persona } from '../../API';
import * as mutations from '../../graphql/mutations';
import * as queries from '../../graphql/queries';
import useAlert from '../../hooks/AlertHook';
import { useBackground } from '../../providers/BackgroundProvider';

const client = generateClient();

export default function EditPersona() {
  // State
  const [persona, setPersona] = useState<Persona>();

  // Hooks
  const { personaId } = useParams();

  // Prevents the page from loading if there is no threadId
  if (!personaId) return null;

  // Hooks
  const navigate = useNavigate();
  const { setBackground } = useBackground();
  const { addAlert } = useAlert();

  /**
   * Delete a persona with the given personaId.
   * @param personaId {string} The personaId to delete.
   */
  const deletePersona = async () => {
    const result = await client.graphql({
      query: mutations.deletePersona,
      variables: {
        input: {
          personaId: personaId
        }
      }
    });

    navigate(`/personas`);
  };

  useEffect(() => {
    setBackground('red');

    // Load Persona data
    client
      .graphql({ query: queries.getPersona, variables: { input: { personaId } } })
      .then(({ data }) => {
        setPersona(data.getPersona as Persona);
        console.log('data: ', data.getPersona);
      })
      .catch((err) => {
        addAlert(err?.message ?? 'Something went wrong', 'error');
      });
  }, []);

  return (
    <div className="flex flex-col justify-center w-full">
      {persona && (
        <div className="flex flex-col justify-center w-full h-full">
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
                  setPersona({ ...persona, voice: { ...persona.voice, style: e.target.value } })
                }
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
          <div className="flex flex-row ml-auto space-x-2">
            <button className="btn-secondary" onClick={deletePersona}>
              Delete
            </button>
            <button className="btn" type="submit">
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

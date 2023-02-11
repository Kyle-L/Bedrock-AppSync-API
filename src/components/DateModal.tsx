import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

interface DateModalProps {
  date: {
    real: {
      title: string;
      description: string;
    };
    mystery: {
      title: string;
      description: string;
    };
    tags: { title: string; color: string }[];
  };
}

export default function DateModal({ date }: DateModalProps) {
  let [isConfirmOpen, setConfirmOpen] = useState(false);
  let [isDateOpen, setDateOpen] = useState(false);

  function onConfirm() {
    setConfirmOpen(false);
    setDateOpen(true);
  }

  function openModal() {
    setConfirmOpen(true);
  }

  function closeModal() {
    setConfirmOpen(false);
    setDateOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="w-full rounded-full py-2 px-4 text-white font-bold bg-purple-500 hover:bg-purple-700 transition duration-200"
      >
        Select this date
      </button>

      <Transition appear show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-filter backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Are you sure?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-base text-gray-500">
                      Are you sure you want to pick{' '}
                      <span className="font-bold">{date.mystery.title}</span> as the date?
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="justify-center rounded-full border border-transparent bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition duration-200"
                      onClick={onConfirm}
                    >
                      Yes please!
                    </button>
                    <button
                      type="button"
                      className="justify-center rounded-full border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition duration-200"
                      onClick={closeModal}
                    >
                      No, I changed my mind
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isDateOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-purple-900 bg-opacity-50 backdrop-filter backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {date.real.title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p
                      className="text-base text-gray-500"
                      dangerouslySetInnerHTML={{ __html: date.real.description }}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="justify-center rounded-full border border-transparent bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

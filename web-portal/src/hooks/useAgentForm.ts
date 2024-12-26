import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addAgent } from '../store/agents/agentsSlice';
import { Agent } from '../store/agents/agentsSlice';
import { validateAgent } from '../utils/agentValidation';

interface AgentFormState {
  name: string;
  modelProvider: string;
  clients: string[];
  bio: string;
  lore: string;
  messageExamples: string;
  postExamples: string;
  topics: string;
  adjectives: string;
  styleAll: string;
  styleChat: string;
  stylePost: string;
  settings: string;
}

export const useAgentForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<AgentFormState>({
    name: '',
    modelProvider: '',
    clients: [],
    bio: '',
    lore: '',
    messageExamples: '',
    postExamples: '',
    topics: '',
    adjectives: '',
    styleAll: '',
    styleChat: '',
    stylePost: '',
    settings: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, options, type } = e.target as HTMLSelectElement & { name: string; value: string; options?: HTMLCollectionOf<HTMLOptionElement> };
    if (name === 'clients' && type === 'select-multiple' && options) {
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preliminary validation
    const { valid, errors } = validateAgent(formData);
    if (!valid) {
      alert(errors.join('\n'));
      return;
    }

    // Convert text fields to arrays or JSON if necessary
    let parsedMessageExamples: any[] = [];
    if (formData.messageExamples) {
      parsedMessageExamples = JSON.parse(formData.messageExamples);
    }

    let parsedSettings: any = {};
    if (formData.settings) {
      parsedSettings = JSON.parse(formData.settings);
    }

    const newAgent = {
      name: formData.name,
      modelProvider: formData.modelProvider,
      clients: formData.clients,
      bio: formData.bio.split('\n').filter((line) => line.trim() !== ''),
      lore: formData.lore.split('\n').filter((line) => line.trim() !== ''),
      messageExamples: parsedMessageExamples,
      postExamples: formData.postExamples.split('\n').filter((line) => line.trim() !== ''),
      topics: formData.topics.split(',').map((topic) => topic.trim()),
      adjectives: formData.adjectives.split(',').map((adj) => adj.trim()),
      style: {
        all: formData.styleAll.split('\n').filter((line) => line.trim() !== ''),
        chat: formData.styleChat.split('\n').filter((line) => line.trim() !== ''),
        post: formData.stylePost.split('\n').filter((line) => line.trim() !== ''),
      },
      settings: parsedSettings,
    } as Agent;

    dispatch(addAgent(newAgent));
    // Reset form
    setFormData({
      name: '',
      modelProvider: '',
      clients: [],
      bio: '',
      lore: '',
      messageExamples: '',
      postExamples: '',
      topics: '',
      adjectives: '',
      styleAll: '',
      styleChat: '',
      stylePost: '',
      settings: '',
    });
  };

  return {
    formData,
    handleChange,
    handleSubmit,
  };
}; 
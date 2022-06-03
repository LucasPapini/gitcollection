import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { api } from '../../service/api';
import { Title, Form, Repos, Error } from './styles';
import Logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom';

interface GithubRepository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard = () => {

  const [repos, setRepos] = React.useState<GithubRepository[]>(() => {
    const storeRepos = localStorage.getItem('@GitCollection:repositories');
    if (storeRepos) {
      return JSON.parse(storeRepos);
    }
    return [];
  });

  const [newRepo, setNewRepo] = React.useState('');
  const [inputError, setInputError] = React.useState('');
  const formEl = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    localStorage.setItem('@GitCollection:repositories', JSON.stringify(repos));
  }, [repos]);

  function handleInputChage(event: React.ChangeEvent<HTMLInputElement>): void {
    setNewRepo(event.target.value);
  }


  async function handleAddRepo(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputError('Informe o username/repositório');
      return;
    }

    try {
      const respose = await api.get<GithubRepository>(`repos/${newRepo}`);
      const repository = respose.data;
      setRepos([...repos, repository]);
      formEl.current?.reset();
      setNewRepo('');
      setInputError('');
    }catch{
      setInputError('Repositório não encontrado no GitHub');
    }
  }

  return (
    <>
      <img src={Logo} alt="GitCollection" />
      <Title>Catalago de repositório do GitHub</Title>
      <Form ref={formEl} hasError={Boolean(inputError)} onSubmit={handleAddRepo}>
        <input placeholder='username/repository_name' onChange={handleInputChage} />
        <button type='submit'>Buscar</button>
      </Form>
      {inputError && <Error>{inputError}</Error>}
      <Repos>
        {repos.map((repositorio, index) => (
          <a href={`/repositories/${repositorio.full_name}`} key={repositorio.full_name + index}>
            <img
              src={repositorio.owner.avatar_url}
              alt={repositorio.owner.login}
            />
            <div>
              <strong>{repositorio.full_name}</strong>
              <p>{repositorio.description}</p>
            </div>
            <FiChevronRight size={20} />
          </a>))}
      </Repos>
    </>
  );
};


export default Dashboard;
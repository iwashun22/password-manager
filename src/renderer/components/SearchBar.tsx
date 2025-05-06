import { FormEvent, MouseEvent } from 'preact/compat';
import { RefObject } from 'preact';
import { Search, Plus } from 'lucide-preact';

import './SearchBar.scss';

interface Props {
  onSearch: (e: FormEvent) => void,
  onAddNew: (e: MouseEvent<HTMLButtonElement>) => void,
  searchRef: RefObject<HTMLInputElement>
  placeholder?: string
}

function SearchBar({ 
  onSearch,
  onAddNew,
  searchRef,
  placeholder = 'Search'
}: Props) {

  return (
    <span className="search-bar">
      <form onSubmit={onSearch}>
        <input type="text" ref={searchRef} placeholder={placeholder} />
        <button type="submit" className="search-button btn">
          <Search className="icon"/>
        </button>
        <AddButton onClick={onAddNew}/>
      </form>
    </span>
  )
}

function AddButton({
  onClick
}: {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void,
}) {
  return (
    <button type="button" className="add-button btn" onClick={onClick}>
      <Plus className="icon"/>
    </button>
  )
}

export default SearchBar;
import { Straw } from './Straw'
import { Needle } from './Needle'

export function HayPile() {
  return (
    <div className="hay-pile" aria-hidden="true">
      <Straw className="pile-s pile-s1" width={92} variant={0} />
      <Straw className="pile-s pile-s2" width={110} variant={1} />
      <Straw className="pile-s pile-s3" width={84} variant={2} />
      <Straw className="pile-s pile-s4" width={70} variant={3} />
      <Straw className="pile-s pile-s5" width={98} variant={1} />
      <Straw className="pile-s pile-s6" width={76} variant={0} />
      <Needle className="pile-needle" width={72} />
    </div>
  )
}

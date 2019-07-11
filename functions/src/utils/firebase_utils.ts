
export const deleteSubcollection = async (snapshot: FirebaseFirestore.DocumentSnapshot, name:string) => {
  const limit = 10;
  let count:number;
  do {
    const sections = await snapshot.ref.collection(name).limit(limit).get();
    count = sections.size;
    sections.forEach(async doc=>{
      await doc.ref.delete();
    });
  } while(count === limit);
}  

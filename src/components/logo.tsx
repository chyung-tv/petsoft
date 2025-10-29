import Image from "next/image";
import logo from "../../public/logo.svg";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        src={logo}
        alt="PetSoft Logo"
        //    width and height is not needed as next can infer it from the SVG file
      />
    </Link>
  );
}

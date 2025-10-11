import React from 'react'
import Logo from '../../components/Logo'
import SearchBar from '~/components/SearchBar'
import { IconBell, IconHelpCircle } from "@tabler/icons-react";
import Image from 'next/image';


const HeadBar = () => {
    return (
        <div className='w-full h-16 bg-white border-b border-b-border flex items-center justify-between px-4'>
            <div>
                <Logo />
            </div>
            <div>
                <SearchBar />
            </div>
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1 cursor-pointer text-gray-500'>
                    <IconHelpCircle className="h-5 w-5 text-gray-500" />
                    Help
                </div>
                <div>
                    <IconBell className="h-7 w-7 border border-border rounded-full p-1.5 text-gray-500" />
                </div>
                <div className="flex items-center gap-1 cursor-pointer border border-border px-2 py-1 rounded-full">
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png"
                        alt="User Avatar"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

export default HeadBar;
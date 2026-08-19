import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { LogOut, User, UserCog } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"

import { Button } from "@/components/ui/button"
// import { getInitials } from "@/lib/utils"

import { DefaultImage } from "@/components/ui/defult-Image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserDropdown({
  dictionary,
  locale,
}: {
  dictionary: DictionaryType
  locale: LocaleType
}) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-lg size-12 p-0"
          aria-label="User"
        >
          <div className="size-full relative rounded-lg overflow-hidden">
            <DefaultImage
              src={user?.avatar}
              alt="Avatar"
              fill
              className="object-cover "
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent forceMount>
        <DropdownMenuLabel className="flex gap-2">
          <div className="size-16 relative rounded-lg overflow-hidden shrink-0">
            <DefaultImage
              src={user?.avatar}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col overflow-hidden max-w-[150px]">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground font-semibold truncate">
              {user?.email}
            </p>
            {user?.role && (
              <p className="text-xs text-muted-foreground font-medium truncate">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href={ensureLocalizedPathname("/account/profile", locale)}
            >
              <User className="me-2 size-4" />
              {dictionary.navigation.userNav.profile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={ensureLocalizedPathname("/pages/account/settings", locale)}
            >
              <UserCog className="me-2 size-4" />
              {dictionary.navigation.userNav.settings}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: ensureLocalizedPathname("/auth", locale) })}>
          <LogOut className="me-2 size-4" />
          {dictionary.navigation.userNav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
